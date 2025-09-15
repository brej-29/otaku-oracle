"""
URL configuration for otaku_oracle project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from core import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.home, name="home"),
    path("playground/", views.playground, name="playground"),
    path("about/", views.about, name="about"),
    path("glb-test/", views.glb_test, name="glb_test"),
    path("api/ask/", views.api_ask, name="api_ask"),
]

handler404 = "core.views.error_view"
handler500 = "core.views.error_view"
