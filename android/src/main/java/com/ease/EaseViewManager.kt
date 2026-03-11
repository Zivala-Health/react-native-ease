package com.ease

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.EaseViewManagerInterface
import com.facebook.react.viewmanagers.EaseViewManagerDelegate

@ReactModule(name = EaseViewManager.NAME)
class EaseViewManager : SimpleViewManager<EaseView>(),
  EaseViewManagerInterface<EaseView> {
  private val mDelegate: ViewManagerDelegate<EaseView>

  init {
    mDelegate = EaseViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<EaseView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): EaseView {
    return EaseView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: EaseView?, color: Int?) {
    view?.setBackgroundColor(color ?: Color.TRANSPARENT)
  }

  companion object {
    const val NAME = "EaseView"
  }
}
