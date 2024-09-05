#include "setup_esp32_cam.h"
#include "esp_camera.h"
#include "rc522.h"
#include <esp_log.h>
#include <inttypes.h>
#include "driver/gpio.h"
#include "mbedtls/base64.h"
#include "config_http_client.h"
#include "esp_http_client.h"
#include <stdio.h>

static rc522_handle_t scanner;
static const char *SETUP_RC522_TAG;

void setup_rc522();
