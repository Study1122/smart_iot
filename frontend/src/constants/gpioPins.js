

export const GPIO_PINS = [
  // PWM capable pins (ESP8266)
  { value: 0,  label: "D3 (GPIO0)",  type: "PWM" },
  { value: 2,  label: "D4 (GPIO2)",  type: "PWM" },
  { value: 4,  label: "D2 (GPIO4)",  type: "PWM" },
  { value: 5,  label: "D1 (GPIO5)",  type: "PWM" },
  { value: 12, label: "D6 (GPIO12)", type: "PWM" },
  { value: 13, label: "D7 (GPIO13)", type: "PWM" },
  { value: 14, label: "D5 (GPIO14)", type: "PWM" },

  // Digital only
  { value: 15, label: "D8 (GPIO15)", type: "DIGITAL" },
  { value: 16, label: "D0 (GPIO16)", type: "DIGITAL" },
];

// helpers
export const getGpioByValue = (value) =>
  GPIO_PINS.find((p) => p.value === value);