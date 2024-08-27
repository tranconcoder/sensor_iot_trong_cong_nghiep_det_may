#include "setup_rc522.h"

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

void on_tag_scanned(uint64_t serial_number) {
    gpio_set_direction(4, GPIO_MODE_OUTPUT);
    gpio_set_level(4, 1);
    vTaskDelay(pdMS_TO_TICKS(1000));
    gpio_set_level(4, 0);

    ESP_LOGI(SETUP_RC522_TAG, "TAG SCANNED!!!!!!!!!!");
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
