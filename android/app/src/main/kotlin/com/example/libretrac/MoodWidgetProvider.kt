package com.example.libretrac            // ← keep the app-id package

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.SharedPreferences
import es.antonborri.home_widget.HomeWidgetProvider

/**
 * Concrete receiver so Android can instantiate it.
 * We don’t do any heavy work here—the Flutter side generates the bitmap.
 */
class MoodWidgetProvider : HomeWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
        widgetData: SharedPreferences
    ) {
        // Nothing extra to do – let the plugin call into Flutter.
        // (You could kick off a WorkManager task here if you ever need it.)
    }
}
