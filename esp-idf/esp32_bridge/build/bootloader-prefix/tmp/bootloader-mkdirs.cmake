# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/home/tvconss/esp/esp-idf/components/bootloader/subproject"
  "/home/tvconss/Workspace/sensor_iot_trong_cong_nghiep_det_may/esp-idf/esp32_bridge/build/bootloader"
  "/home/tvconss/Workspace/sensor_iot_trong_cong_nghiep_det_may/esp-idf/esp32_bridge/build/bootloader-prefix"
  "/home/tvconss/Workspace/sensor_iot_trong_cong_nghiep_det_may/esp-idf/esp32_bridge/build/bootloader-prefix/tmp"
  "/home/tvconss/Workspace/sensor_iot_trong_cong_nghiep_det_may/esp-idf/esp32_bridge/build/bootloader-prefix/src/bootloader-stamp"
  "/home/tvconss/Workspace/sensor_iot_trong_cong_nghiep_det_may/esp-idf/esp32_bridge/build/bootloader-prefix/src"
  "/home/tvconss/Workspace/sensor_iot_trong_cong_nghiep_det_may/esp-idf/esp32_bridge/build/bootloader-prefix/src/bootloader-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/home/tvconss/Workspace/sensor_iot_trong_cong_nghiep_det_may/esp-idf/esp32_bridge/build/bootloader-prefix/src/bootloader-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/home/tvconss/Workspace/sensor_iot_trong_cong_nghiep_det_may/esp-idf/esp32_bridge/build/bootloader-prefix/src/bootloader-stamp${cfgdir}") # cfgdir has leading slash
endif()
