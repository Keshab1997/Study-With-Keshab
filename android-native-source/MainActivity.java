package com.studywithkeshab.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // WebView সেটআপ
        webView = findViewById(R.id.webview);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("https://keshab1997.github.io/Study-With-Keshab/");

        // Firebase Topic-এ সাবস্ক্রাইব করা
        FirebaseMessaging.getInstance().subscribeToTopic("all_android_users")
            .addOnCompleteListener(task -> {
                String msg = "Subscribed to notifications";
                if (!task.isSuccessful()) {
                    msg = "Subscription failed";
                }
                System.out.println(msg);
            });
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
