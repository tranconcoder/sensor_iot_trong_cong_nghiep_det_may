#include <inttypes.h>
#include "freertos/FreeRTOS.h"
#include "freertos/timers.h"
#include "freertos/task.h"
#include "esp_mac.h"
#include "esp_wifi.h"
#include "esp_bridge.h"
#include "esp_mesh_lite.h"
#include "esp_log.h"
#include <esp_system.h>
#include "nvs_flash.h"
#include <stdint.h>
#include <sys/param.h>
#include <sys/socket.h>
#include <stdlib.h>
#include "driver/gpio.h"
#include <stdio.h>

#include "setup_rc522.h"
#include "setup_esp32_cam.h"
#include "config_http_client.h"
#include "esp_websocket_client.h"
#include "setup_esp_websocket_client.h"

#include "esp_tls.h"
#include "esp_event.h"
#include "esp_netif.h"

// TASK STACK SIZE
#define STACK_SIZE 4 * 1024

static int g_sockfd = -1;
static const char *TAG = "main";

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

    while (true)
    {
        if (g_sockfd == -1)
        {
            vTaskDelay(500 / portTICK_PERIOD_MS);
            g_sockfd = socket_tcp_client_create(CONFIG_SERVER_IP, CONFIG_SERVER_PORT);
            continue;
        }

        vTaskDelay(pdMS_TO_TICKS(3000));

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

static void ip_event_sta_got_ip_handler(void *arg, esp_event_base_t event_base,
                                        int32_t event_id, void *event_data)
{
    static bool tcp_task = false;

    if (!tcp_task)
    {
        xTaskCreate(
            tcp_client_write_task,
            "tcp_client_write_task",
            STACK_SIZE,
            NULL,
            1,
            NULL);
        tcp_task = true;
    }
}

static esp_err_t esp_storage_init(void)
{
    esp_err_t ret = nvs_flash_init();

    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        // NVS partition was truncated and needs to be erased
        // Retry nvs_flash_init
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

    // Softap
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

void app_main()
{
    esp_log_level_set("*", ESP_LOG_INFO);

    esp_storage_init();

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    esp_bridge_create_all_netif();
    wifi_init();
    esp_mesh_lite_config_t mesh_lite_config = ESP_MESH_LITE_DEFAULT_INIT();
    esp_mesh_lite_init(&mesh_lite_config);
    app_wifi_set_softap_info();
    esp_mesh_lite_start();

    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &ip_event_sta_got_ip_handler, NULL, NULL));

    // Init camera
    esp_err_t init_camera = setup_esp32_cam();
    while (init_camera != ESP_OK)
    {
        ESP_LOGI(TAG, "Camera deiniting...");
        init_camera = esp_camera_deinit();
        vTaskDelay(pdMS_TO_TICKS(3000));
    }

    sensor_t *s = esp_camera_sensor_get();
    s->set_brightness(s, 2);
    s->set_saturation(s, 200);
    s->set_sharpness(s, 200);

    // setup_esp_websocket_client_init();
    setup_rc522();

    while (true)
    {
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
