import 'package:flutter/material.dart';

class TighterPageScrollPhysics extends PageScrollPhysics {
  const TighterPageScrollPhysics({super.parent});

  @override
  TighterPageScrollPhysics applyTo(ScrollPhysics? ancestor) =>
      TighterPageScrollPhysics(parent: buildParent(ancestor));

  static const double _kDragThreshold = 0.01; // ← was 0.50

  double getTargetPixels(
    ScrollMetrics position,
    Tolerance tolerance,
    double velocity,
  ) {
    final page = position.pixels / position.viewportDimension;
    double targetPage;

    if (velocity < -tolerance.velocity) {
      targetPage = page - 0.5;
    } else if (velocity > tolerance.velocity) {
      targetPage = page + 0.5;
    } else {
      final delta = page - page.roundToDouble();
      if (delta.abs() > _kDragThreshold) {
        targetPage = delta > 0 ? page.ceilToDouble() : page.floorToDouble();
      } else {
        targetPage = page.roundToDouble();
      }
    }

    return targetPage * position.viewportDimension;
  }
}
