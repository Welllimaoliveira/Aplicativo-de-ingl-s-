package com.falareal.academy;

import android.Manifest;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int MIC_REQUEST = 100;
    private WebView webView;
    private TextToSpeech tts;
    private SpeechRecognizer recognizer;
    private String requestId = "0";
    private String pendingExpected = "";
    private String pendingId = "0";
    private boolean recognitionBusy = false;

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        webView = new WebView(this);
        setContentView(webView);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new TTSBridge(), "AndroidTTS");
        webView.addJavascriptInterface(new SpeechBridge(), "AndroidSpeech");
        initTts();
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void initTts() {
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) tts.setLanguage(Locale.US);
        });
    }

    private boolean hasMicPermission() {
        return Build.VERSION.SDK_INT < 23 || checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    private void ensureRecognizer() {
        if (recognizer != null) return;
        if (!SpeechRecognizer.isRecognitionAvailable(this)) return;
        recognizer = SpeechRecognizer.createSpeechRecognizer(this);
        recognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) { js("window.onNativeSpeechReady(" + quote(requestId) + ")"); }
            @Override public void onBeginningOfSpeech() { recognitionBusy = true; }
            @Override public void onRmsChanged(float rmsdB) {}
            @Override public void onBufferReceived(byte[] buffer) {}
            @Override public void onEndOfSpeech() { js("window.onNativeSpeechEnd(" + quote(requestId) + ")"); }
            @Override public void onPartialResults(Bundle partialResults) {}
            @Override public void onEvent(int eventType, Bundle params) {}
            @Override public void onError(int error) {
                recognitionBusy = false;
                js("window.onNativeSpeechError(" + quote(requestId) + "," + quote(recognitionErrorMessage(error)) + ")");
            }
            @Override public void onResults(Bundle results) {
                recognitionBusy = false;
                ArrayList<String> list = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                String text = (list != null && !list.isEmpty()) ? list.get(0) : "";
                float confidence = -1f;
                float[] scores = results.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES);
                if (scores != null && scores.length > 0) confidence = scores[0];
                js("window.onNativeSpeechResult(" + quote(requestId) + "," + quote(text) + "," + confidence + ")");
            }
        });
    }

    private String recognitionErrorMessage(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_AUDIO: return "Erro ao acessar o microfone. Feche outros apps que estejam usando o áudio e tente novamente.";
            case SpeechRecognizer.ERROR_CLIENT: return "O reconhecimento foi interrompido. Toque no microfone e tente novamente.";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: return "Permissão de microfone negada. Abra Configurações > Apps > Fala Real Academy > Permissões > Microfone.";
            case SpeechRecognizer.ERROR_NETWORK: return "O serviço de voz precisa de conexão neste aparelho. Verifique a internet e tente novamente.";
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: return "A conexão do reconhecimento de voz demorou demais. Tente novamente.";
            case SpeechRecognizer.ERROR_NO_MATCH: return "Não consegui entender a frase. Fale um pouco mais devagar e tente novamente.";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: return "O microfone ainda está processando a tentativa anterior. Aguarde um instante e tente novamente.";
            case SpeechRecognizer.ERROR_SERVER: return "O serviço de reconhecimento de voz apresentou um erro. Tente novamente.";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: return "Não ouvi nenhuma fala. Toque no microfone e fale após ele indicar que está ouvindo.";
            default:
                if (Build.VERSION.SDK_INT >= 31 && error == SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED) return "O reconhecimento em inglês não é suportado pelo serviço de voz instalado.";
                if (Build.VERSION.SDK_INT >= 31 && error == SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE) return "O pacote de voz em inglês não está disponível. Instale/baixe inglês no serviço de voz do Android.";
                return "Não consegui reconhecer sua fala (erro " + error + "). Tente novamente.";
        }
    }

    private void startRecognitionNow(String expected, String id) {
        requestId = id;
        if (!hasMicPermission()) {
            pendingExpected = expected; pendingId = id;
            js("window.onNativeSpeechPermission('requesting','Autorize o acesso ao microfone para continuar.')");
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, MIC_REQUEST);
            return;
        }
        ensureRecognizer();
        if (recognizer == null) {
            js("window.onNativeSpeechError(" + quote(id) + "," + quote("Nenhum serviço de reconhecimento de voz foi encontrado. Verifique se o app Google/Speech Services está instalado e ativado.") + ")");
            return;
        }
        if (recognitionBusy) {
            js("window.onNativeSpeechError(" + quote(id) + "," + quote("O microfone ainda está processando a tentativa anterior. Aguarde um instante.") + ")");
            return;
        }
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "en-US");
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        try {
            recognitionBusy = true;
            recognizer.startListening(intent);
        } catch (Exception e) {
            recognitionBusy = false;
            js("window.onNativeSpeechError(" + quote(id) + "," + quote("Não consegui iniciar o microfone: " + e.getMessage()) + ")");
        }
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != MIC_REQUEST) return;
        boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
        if (granted) {
            js("window.onNativeSpeechPermission('granted','Microfone autorizado. Preparando para ouvir...')");
            String expected = pendingExpected, id = pendingId;
            pendingExpected = ""; pendingId = "0";
            startRecognitionNow(expected, id);
        } else {
            recognitionBusy = false;
            js("window.onNativeSpeechPermission('denied','Permissão de microfone negada. Abra Configurações > Apps > Fala Real Academy > Permissões > Microfone.')");
        }
    }

    private void js(String code) { webView.post(() -> webView.evaluateJavascript(code, null)); }
    private static String quote(String s) {
        if (s == null) s = "";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ") + "\"";
    }

    public class TTSBridge {
        @JavascriptInterface public void speak(String text, String lang) {
            runOnUiThread(() -> {
                if (tts == null) return;
                Locale locale = (lang != null && lang.toLowerCase().startsWith("pt")) ? new Locale("pt", "BR") : Locale.US;
                int available = tts.setLanguage(locale);
                if (available == TextToSpeech.LANG_MISSING_DATA || available == TextToSpeech.LANG_NOT_SUPPORTED) {
                    js("window.onNativeSpeechError('tts'," + quote("A voz " + locale.toLanguageTag() + " não está instalada neste aparelho.") + ")");
                    return;
                }
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "fala-real");
            });
        }
    }

    public class SpeechBridge {
        @JavascriptInterface public void startListening(String expected, String id) {
            runOnUiThread(() -> startRecognitionNow(expected, id));
        }
        @JavascriptInterface public boolean hasPermission() { return hasMicPermission(); }
        @JavascriptInterface public boolean isRecognitionAvailable() { return SpeechRecognizer.isRecognitionAvailable(MainActivity.this); }
    }

    @Override protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
        if (recognizer != null) { recognizer.cancel(); recognizer.destroy(); }
        super.onDestroy();
    }
}