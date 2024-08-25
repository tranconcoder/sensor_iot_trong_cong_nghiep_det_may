#include <inttypes.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/timers.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_bridge.h"
#include "esp_mesh_lite.h"
#include "esp_mac.h"
#include "nvs_flash.h"
#include <sys/socket.h>
#include "esp_heap_caps.h"

// Save image with http server
#include "esp_http_server.h"
#include "esp_timer.h"

// ESP mesh lite setup
static int g_sockfd = -1;
static const char *TAG = "local_control";
// static const uint8_t ESP32CAM_MAC[] = { 0x08, 0xa6, 0xf7, 0x11, 0x51, 0xa8 };

// Camera setup
#define ESP_MESH_PAYLOAD_LEN 249
#define ESP_MESH_PAYLOAD_HEADER_LEN 4
#define FPS_SEND_LIMIT 10

typedef uint8_t chunk_data[ESP_MESH_PAYLOAD_LEN - ESP_MESH_PAYLOAD_HEADER_LEN];
typedef struct
{
    httpd_req_t *req;
    size_t len;
} jpg_chunking_t;

static int socket_tcp_client_create(const char *ip, uint16_t port)
{
    ESP_LOGD(TAG, "Create a tcp client, ip: %s, port: %d", ip, port);

    esp_err_t ret = ESP_OK;
    int sockfd = -1;
    struct ifreq iface;
    memset(&iface, 0x0, sizeof(iface));
    struct sockaddr_in server_addr = {
        .sin_family = AF_INET,
        .sin_port = htons(port),
        .sin_addr.s_addr = inet_addr(ip),
    };

    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0)
    {
        ESP_LOGE(TAG, "socket create, sockfd: %d", sockfd);
        goto ERR_EXIT;
    }

    esp_netif_get_netif_impl_name(esp_netif_get_handle_from_ifkey("WIFI_STA_DEF"), iface.ifr_name);
    if (setsockopt(sockfd, SOL_SOCKET, SO_BINDTODEVICE, &iface, sizeof(struct ifreq)) != 0)
    {
        ESP_LOGE(TAG, "Bind [sock=%d] to interface %s fail", sockfd, iface.ifr_name);
    }

    ret = connect(sockfd, (struct sockaddr *)&server_addr, sizeof(struct sockaddr_in));
    if (ret < 0)
    {
        ESP_LOGD(TAG, "socket connect, ret: %d, ip: %s, port: %d",
                 ret, ip, port);
        goto ERR_EXIT;
    }
    return sockfd;

ERR_EXIT:

    if (sockfd != -1)
    {
        close(sockfd);
    }

    return -1;
}

void tcp_client_write_task(void *arg)
{
    size_t size = 0;
    int count = 0;
    char *data = NULL;
    esp_err_t ret = ESP_OK;
    uint8_t sta_mac[6] = {0};

    esp_wifi_get_mac(ESP_IF_WIFI_STA, sta_mac);

    ESP_LOGI(TAG, "TCP client write task is running");

    while (1)
    {
        if (g_sockfd == -1)
        {
            vTaskDelay(500 / portTICK_PERIOD_MS);
            g_sockfd = socket_tcp_client_create(CONFIG_SERVER_IP, CONFIG_SERVER_PORT);
            continue;
        }

        vTaskDelay(3000 / portTICK_PERIOD_MS);

        size = asprintf(&data, "{\"src_addr\": \"" MACSTR "\",\"data\": \"Hello TCP Server!\",\"level\": %d,\"count\": %d}\r\n",
                        MAC2STR(sta_mac), esp_mesh_lite_get_level(), count++);

        ESP_LOGD(TAG, "TCP write, size: %d, data: %s", size, data);
        ret = write(g_sockfd, data, size);
        free(data);

        if (ret <= 0)
        {
            ESP_LOGE(TAG, "<%s> TCP write", strerror(errno));
            close(g_sockfd);
            g_sockfd = -1;
            continue;
        }
    }

    ESP_LOGI(TAG, "TCP client write task is exit");

    close(g_sockfd);
    g_sockfd = -1;
    if (data)
    {
        free(data);
    }
    vTaskDelete(NULL);
}

/**
 * @brief Timed printing system information
 */
static void print_system_info_timercb(TimerHandle_t timer)
{
    uint8_t primary = 0;
    uint8_t sta_mac[6] = {0};
    wifi_ap_record_t ap_info = {0};
    wifi_second_chan_t second = 0;
    wifi_sta_list_t wifi_sta_list = {0x0};

    esp_wifi_sta_get_ap_info(&ap_info);
    esp_wifi_get_mac(ESP_IF_WIFI_STA, sta_mac);
    esp_wifi_ap_get_sta_list(&wifi_sta_list);
    esp_wifi_get_channel(&primary, &second);

    ESP_LOGI(TAG, "System information, channel: %d, layer: %d, self mac: " MACSTR ", parent bssid: " MACSTR ", parent rssi: %d, free heap: %" PRIu32 "", primary,
             esp_mesh_lite_get_level(), MAC2STR(sta_mac), MAC2STR(ap_info.bssid),
             (ap_info.rssi != 0 ? ap_info.rssi : -120), esp_get_free_heap_size());
#if CONFIG_MESH_LITE_MAXIMUM_NODE_NUMBER
    ESP_LOGI(TAG, "child node number: %d", esp_mesh_lite_get_child_node_number());
#endif
    for (int i = 0; i < wifi_sta_list.num; i++)
    {
        ESP_LOGI(TAG, "Child mac: " MACSTR, MAC2STR(wifi_sta_list.sta[i].mac));
    }
}

static void ip_event_sta_got_ip_handler(void *arg, esp_event_base_t event_base,
                                        int32_t event_id, void *event_data)
{
    static bool tcp_task = false;

    if (!tcp_task)
    {
        xTaskCreate(tcp_client_write_task, "tcp_client_write_task", 4 * 1024, NULL, 5, NULL);
        tcp_task = true;
    }
}

static esp_err_t esp_storage_init(void)
{
    esp_err_t ret = nvs_flash_init();

    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }

    return ret;
}

static void wifi_init(void)
{
    // Station
    wifi_config_t wifi_config = {
        .sta = {
            .ssid = CONFIG_ROUTER_SSID,
            .password = CONFIG_ROUTER_PASSWORD,
        },
    };
    esp_bridge_wifi_set_config(WIFI_IF_STA, &wifi_config);

    // SoftAP
    snprintf((char *)wifi_config.ap.ssid, sizeof(wifi_config.ap.ssid), "%s", CONFIG_BRIDGE_SOFTAP_SSID);
    strlcpy((char *)wifi_config.ap.password, CONFIG_BRIDGE_SOFTAP_PASSWORD, sizeof(wifi_config.ap.password));
    esp_bridge_wifi_set_config(WIFI_IF_AP, &wifi_config);
}

void app_wifi_set_softap_info(void)
{
    char softap_ssid[32];
    uint8_t softap_mac[6];
    esp_wifi_get_mac(WIFI_IF_AP, softap_mac);
    memset(softap_ssid, 0x0, sizeof(softap_ssid));

#ifdef CONFIG_BRIDGE_SOFTAP_SSID_END_WITH_THE_MAC
    snprintf(softap_ssid, sizeof(softap_ssid), "%.25s_%02x%02x%02x", CONFIG_BRIDGE_SOFTAP_SSID, softap_mac[3], softap_mac[4], softap_mac[5]);
#else
    snprintf(softap_ssid, sizeof(softap_ssid), "%.32s", CONFIG_BRIDGE_SOFTAP_SSID);
#endif
    esp_mesh_lite_set_softap_ssid_to_nvs(softap_ssid);
    esp_mesh_lite_set_softap_psw_to_nvs(CONFIG_BRIDGE_SOFTAP_PASSWORD);
    esp_mesh_lite_set_softap_info(softap_ssid, CONFIG_BRIDGE_SOFTAP_PASSWORD);
}

//
// SETUP HTTPD SERVER
//
#define PART_BOUNDARY "123456789000000000000987654321"
static const char *_STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char *_STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char *_STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";
uint8_t pic_id = 0;
uint8_t pic_last_id = 0;
uint8_t *pic_data = NULL;
uint16_t pic_data_size = 0;

esp_err_t handle_get_image(httpd_req_t *req)
{
    char *part_buf[64];
    static int64_t last_frame = 0;
    if (!last_frame)
    {
        last_frame = esp_timer_get_time();
    }
    esp_err_t res = ESP_OK;

    res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
    if (res != ESP_OK)
    {
        return res;
    }

    while (true)
    {
        pic_last_id = pic_id;

        if (!pic_data)
        {
            ESP_LOGE(TAG, "Picture data is NULL!");
            res = ESP_FAIL;
            break;
        }

        if (res == ESP_OK)
            res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));

        if (res == ESP_OK)
        {
            size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, pic_data_size);
            res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
        }

        if (res == ESP_OK)
            res = httpd_resp_send_chunk(req, (const char *)pic_data, pic_data_size);

        if (res != ESP_OK)
            break;

        int64_t fr_end = esp_timer_get_time();
        int64_t frame_time = fr_end - last_frame;
        last_frame = fr_end;
        frame_time /= 1000;
        ESP_LOGI(TAG, "MJPG: %luKB %lums (%.1ffps)",
                 (uint32_t)(pic_data_size / 1024),
                 (uint32_t)frame_time, 1000.0 / (uint32_t)frame_time);

        while (pic_id == pic_last_id)
            vTaskDelay(((1000 / FPS_SEND_LIMIT) - (0.1 * (1000 / FPS_SEND_LIMIT))) / portTICK_PERIOD_MS);
    }

    last_frame = 0;
    return res;
}
httpd_uri_t uri_get_image = {
    .uri = "/stream-image",
    .method = HTTP_GET,
    .handler = handle_get_image,
    .user_ctx = NULL};

httpd_handle_t start_webserver(void)
{
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    httpd_handle_t server = NULL;

    if (httpd_start(&server, &config) == ESP_OK)
    {
        httpd_register_uri_handler(server, &uri_get_image);
    }

    return server;
}

static size_t jpg_encode_stream(void *arg, size_t index, const void *data, size_t len)
{
    jpg_chunking_t *j = (jpg_chunking_t *)arg;
    if (!index)
    {
        j->len = 0;
    }
    if (httpd_resp_send_chunk(j->req, (const char *)data, len) != ESP_OK)
    {
        return 0;
    }
    j->len += len;
    return len;
}

chunk_data *image_chunks = NULL;
uint8_t last_image_id = 0;
uint8_t prev_chunk = 0;
uint8_t chunk_count = 0;

static void espnow_mesh_lite_receive_callback(const uint8_t *mac_addr, const uint8_t *data, int len)
{
    if (mac_addr == NULL || data == NULL || len <= 0)
    {
        ESP_LOGE(TAG, "Receive cb arg error");
        return;
    }
    ESP_LOGE(TAG, "Reviced data");
}

void app_main()
{
    esp_log_level_set("*", ESP_LOG_INFO);
    esp_storage_init();

    //
    // SETUP MESH LITE
    //
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_bridge_create_all_netif();
    wifi_init();
    esp_mesh_lite_config_t mesh_lite_config = ESP_MESH_LITE_DEFAULT_INIT();
    esp_mesh_lite_init(&mesh_lite_config);
    app_wifi_set_softap_info();
    esp_mesh_lite_start();
    esp_mesh_lite_espnow_recv_cb_register(ESPNOW_DATA_TYPE_RESERVE, espnow_mesh_lite_receive_callback);

    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &ip_event_sta_got_ip_handler, NULL, NULL));

    TimerHandle_t timer = xTimerCreate("print_system_info", 10000 / portTICK_PERIOD_MS,
                                       true, NULL, print_system_info_timercb);

    start_webserver();
}
