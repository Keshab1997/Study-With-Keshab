package com.studywithkeshab.app;

import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        
        // ১. জাভাস্ক্রিপ্ট এবং স্টোরেজ সেটিংস
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        
        // ২. পপ-আপ উইন্ডো সেটিংস (লগইনের জন্য জরুরি)
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setSupportMultipleWindows(true);

        // ৩. User Agent (গুগল যাতে অ্যাপটিকে ব্রাউজার মনে করে)
        String newUserAgent = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36";
        webSettings.setUserAgentString(newUserAgent);

        // ৪. WebChromeClient (ক্লিক কাজ করানোর জন্য)
        webView.setWebChromeClient(new WebChromeClient());

        // ৫. লিঙ্ক যাতে অ্যাপের ভেতরেই লোড হয়
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return false;
            }
        });

        webView.loadUrl("https://keshab1997.github.io/Study-With-Keshab/");

        // Firebase Topic-এ সাবস্ক্রাইব করা
        FirebaseMessaging.getInstance().subscribeToTopic("all_android_users");

        // ব্যাক বাটন লজিক
        OnBackPressedCallback callback = new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        };
        getOnBackPressedDispatcher().addCallback(this, callback);
    }
}
