#ifndef FEATURE_STATE_H
#define FEATURE_STATE_H

struct FeatureState {
  int gpio;
  bool lastState;
  int lastLevel;
};

#endif