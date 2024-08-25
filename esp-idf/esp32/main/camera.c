#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"

#include "esp_camera.h"
#include "esp_timer.h"

#include "peer_connection.h"

extern PeerConnection *g_pc;
extern int gDataChannelOpened;
extern PeerConnectionState eState;
extern SemaphoreHandle_t xSemaphore;
extern int get_timestamp();
static const char *TAG = "Camera";

void camera_task(void *pvParameters)
{

  static int fps = 0;
  static int64_t last_time;
  int64_t curr_time;

  camera_fb_t *fb = NULL;

  ESP_LOGI(TAG, "Camera Task Started");

  last_time = get_timestamp();

  for (;;)
  {

    if ((eState == PEER_CONNECTION_COMPLETED) && gDataChannelOpened)
    {

      fb = esp_camera_fb_get();

      if (!fb)
      {

        ESP_LOGE(TAG, "Camera capture failed");
      }

      // ESP_LOGI(TAG, "Camera captured. size=%zu, timestamp=%llu", fb->len, fb->timestamp);
      if (xSemaphoreTake(xSemaphore, portMAX_DELAY))
      {
        peer_connection_datachannel_send(g_pc, (char *)fb->buf, fb->len);
        xSemaphoreGive(xSemaphore);
      }

      fps++;

      if ((fps % 100) == 0)
      {

        curr_time = get_timestamp();
        ESP_LOGI(TAG, "Camera FPS=%.2f", 1000.0f / (float)(curr_time - last_time) * 100.0f);
        last_time = curr_time;
      }

      esp_camera_fb_return(fb);
    }

    vTaskDelay(pdMS_TO_TICKS(1000 / 20));
  }
}
