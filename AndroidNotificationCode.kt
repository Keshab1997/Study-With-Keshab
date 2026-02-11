// Android App এ এই code যোগ করুন

// 1. build.gradle (Module: app) এ dependencies যোগ করুন:
dependencies {
    implementation("io.github.jan-tennert.supabase:postgrest-kt:2.0.0")
    implementation("io.github.jan-tennert.supabase:realtime-kt:2.0.0")
    implementation("io.ktor:ktor-client-android:2.3.0")
}

// 2. MainActivity.kt বা Application class এ Supabase setup করুন:
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    
    private val supabase = createSupabaseClient(
        supabaseUrl = "https://yofmaciyxrwvqyzyltml.supabase.co",
        supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZm1hY2l5eHJ3dnF5enlsdG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1OTQ4NzksImV4cCI6MjA1MjE3MDg3OX0.YOUR_ANON_KEY"
    ) {
        install(Postgrest)
        install(Realtime)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Notification listener start করুন
        listenForNotifications()
    }

    private fun listenForNotifications() {
        CoroutineScope(Dispatchers.IO).launch {
            val channel = supabase.channel("android_notifications")
            
            channel.postgresChangeFlow<PostgresAction.Insert>(schema = "public") {
                table = "android_notifications"
            }.collect { change ->
                val title = change.record["title"] as? String ?: "Notification"
                val message = change.record["message"] as? String ?: ""
                
                // Main thread এ notification show করুন
                runOnUiThread {
                    showNotification(title, message)
                }
            }
            
            channel.subscribe()
        }
    }

    private fun showNotification(title: String, message: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "study_notifications"
        
        // Android 8.0+ এর জন্য notification channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Study Notifications",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }
        
        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
}

// 3. AndroidManifest.xml এ permission যোগ করুন:
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.INTERNET" />
