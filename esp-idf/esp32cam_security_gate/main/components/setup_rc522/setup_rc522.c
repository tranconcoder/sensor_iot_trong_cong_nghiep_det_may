#include "setup_rc522.h"
#include "config_http_client.h"
#include "esp_http_client.h"
#include <stdio.h>

static rc522_handle_t scanner;
static const char *SETUP_RC522_TAG = "setup_rc522";

static void rc522_handler(void (*on_tag_scanned)(uint64_t serial_number), esp_event_base_t base, int32_t event_id, void *event_data)
{
     rc522_event_data_t *data = (rc522_event_data_t *)event_data;

     switch (event_id)
     {
     case RC522_EVENT_TAG_SCANNED:
     {
        rc522_tag_t *tag = (rc522_tag_t *)data->ptr;
        uint64_t serial_number = tag->serial_number;
        on_tag_scanned(serial_number);
        break;
     }
     default: 
     {
         ESP_LOGI(SETUP_RC522_TAG, "Unknown tag event rc522!");
     }
     }
}

void on_tag_scanned(uint64_t serial_number)
{
    char serial_number_char[43];
    sprintf(serial_number_char, "{\"serial_number\":\"%022llu\"}", serial_number);
    ESP_LOGI(SETUP_RC522_TAG, "TAG SCANNED: %s", serial_number_char);
    esp_http_client_config_t http_webserver_config = {
        .host = "192.168.1.88",
        .port = 3000,
        .path = "/api/security-gate/auth-serial-number",
        .event_handler = _http_event_handle,
    };
    esp_http_client_handle_t client = esp_http_client_init(&http_webserver_config);

    esp_http_client_set_method(client, HTTP_METHOD_POST);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, serial_number_char, strlen(serial_number_char));

    esp_http_client_perform(client);

    esp_http_client_cleanup(client);
}

void setup_rc522()
{
     rc522_config_t rc522_config = {
         .spi.host = VSPI_HOST,
         .spi.miso_gpio = 12,
         .spi.mosi_gpio = 13,
         .spi.sck_gpio = 14,
         .spi.sda_gpio = 15,
     };

     rc522_create(&rc522_config, &scanner);
     rc522_register_events(scanner, RC522_EVENT_ANY, rc522_handler, on_tag_scanned);
     rc522_start(scanner);
}
