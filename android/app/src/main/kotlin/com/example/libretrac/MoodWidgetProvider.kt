package com.example.libretrac

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.SharedPreferences
import android.graphics.BitmapFactory
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetProvider
import com.example.libretrac.R   // auto-import this

/**
 * Android entry-point for the LibreTrac homescreen widget.
 * All heavy lifting (chart → PNG) happens in Flutter; here we just push
 * that PNG into the ImageView inside @layout/mood_widget.
 */
class MoodWidgetProvider : HomeWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
        widgetData: SharedPreferences
    ) {
        appWidgetIds.forEach { widgetId ->
            val views = RemoteViews(context.packageName, R.layout.mood_widget)

            // The Dart side saved the rendered PNG path under the same key we passed
            // to renderFlutterWidget(key: 'widget_image')
            val imagePath = widgetData.getString("widget_image", null)
            if (imagePath != null) {
                BitmapFactory.decodeFile(imagePath)?.let { bmp ->
                    views.setImageViewBitmap(R.id.widget_image, bmp)
                }
            }

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
