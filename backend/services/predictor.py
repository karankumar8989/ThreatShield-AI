import os
import re
import urllib.parse
import joblib
import warnings
from typing import Tuple

# Suppress sklearn UserWarning when feature names are not matching during prediction
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

# ==========================
# Model Paths
# ==========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")

url_model_path = os.path.join(MODEL_DIR, "url_rf_model.pkl")
sms_model_path = os.path.join(MODEL_DIR, "sms_model.pkl")
sms_tfidf_path = os.path.join(MODEL_DIR, "tfidf.pkl")
email_model_path = os.path.join(MODEL_DIR, "email_spam_model.pkl")

# ==========================
# Load Models
# ==========================

try:
    url_model = joblib.load(url_model_path)
    print("SUCCESS: URL model loaded")
except Exception as e:
    print("ERROR: URL model failed to load:", e)
    url_model = None

try:
    sms_model = joblib.load(sms_model_path)
    sms_tfidf = joblib.load(sms_tfidf_path)
    print("SUCCESS: SMS model loaded")
except Exception as e:
    print("ERROR: SMS model failed to load:", e)
    sms_model = None
    sms_tfidf = None

try:
    email_model = joblib.load(email_model_path)
    print("SUCCESS: Email model loaded")
except Exception as e:
    print("ERROR: Email model failed to load:", e)
    email_model = None

# ==========================
# Feature Extractors
# ==========================

def extract_url_features(url: str, feature_names_in) -> list:
    parsed = urllib.parse.urlparse(url)
    hostname = parsed.netloc
    if ':' in hostname:
        hostname = hostname.split(':')[0]
    path = parsed.path
    query = parsed.query

    # Lexical features
    url_len = len(url)
    dots = url.count('.')
    dots_host = hostname.count('.')
    subdomain_level = max(0, dots_host - 1)
    path_level = path.count('/')
    dash = url.count('-')
    dash_host = hostname.count('-')
    at_symbol = 1 if '@' in url else 0
    tilde = 1 if '~' in url else 0
    underscore = url.count('_')
    percent = url.count('%')
    
    if not query:
        num_query_components = 0
    else:
        num_query_components = len(urllib.parse.parse_qsl(query))
        
    ampersand = url.count('&')
    hash_symbol = url.count('#')
    numeric_chars = sum(c.isdigit() for c in url)
    no_https = 0 if parsed.scheme == 'https' else 1
    
    random_str = 0
    is_ip = 1 if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname) else 0
    domain_in_sub = 0
    domain_in_path = 0
    https_in_host = 1 if 'https' in hostname.lower() else 0
    host_len = len(hostname)
    path_len = len(path)
    query_len = len(query)
    double_slash_path = 1 if '//' in path else 0
    
    sensitive_words = ["secure", "login", "webscr", "ebayisapi", "signin", "banking", "confirm"]
    num_sensitive = sum(1 for kw in sensitive_words if kw in url.lower())
    
    embedded_brand = 0

    # HTML/Page Content default values for URL lexical-only check
    pct_ext_hyperlinks = 0.0
    pct_ext_resource_urls = 0.0
    ext_favicon = 0
    insecure_forms = 0
    relative_form_action = 0
    ext_form_action = 0
    abnormal_form_action = 0
    pct_null_self_redirect = 0.0
    freq_domain_mismatch = 0
    fake_link_status = 0
    right_click_disabled = 0
    popup_window = 0
    submit_to_email = 0
    iframe_or_frame = 0
    missing_title = 0
    images_only_form = 0

    # RT Rule-based Thresholds mapping to -1 (phishing), 0 (suspicious), 1 (legitimate)
    if subdomain_level <= 1:
        subdomain_level_rt = 1
    elif subdomain_level == 2:
        subdomain_level_rt = 0
    else:
        subdomain_level_rt = -1
        
    if url_len < 54:
        url_len_rt = 1
    elif url_len <= 75:
        url_len_rt = 0
    else:
        url_len_rt = -1
        
    pct_ext_resource_urls_rt = 1
    abnormal_ext_form_action_r = 1
    ext_meta_script_link_rt = 1
    pct_ext_null_self_redirect_rt = 1

    feature_dict = {
        'NumDots': dots,
        'SubdomainLevel': subdomain_level,
        'PathLevel': path_level,
        'UrlLength': url_len,
        'NumDash': dash,
        'NumDashInHostname': dash_host,
        'AtSymbol': at_symbol,
        'TildeSymbol': tilde,
        'NumUnderscore': underscore,
        'NumPercent': percent,
        'NumQueryComponents': num_query_components,
        'NumAmpersand': ampersand,
        'NumHash': hash_symbol,
        'NumNumericChars': numeric_chars,
        'NoHttps': no_https,
        'RandomString': random_str,
        'IpAddress': is_ip,
        'DomainInSubdomains': domain_in_sub,
        'DomainInPaths': domain_in_path,
        'HttpsInHostname': https_in_host,
        'HostnameLength': host_len,
        'PathLength': path_len,
        'QueryLength': query_len,
        'DoubleSlashInPath': double_slash_path,
        'NumSensitiveWords': num_sensitive,
        'EmbeddedBrandName': embedded_brand,
        'PctExtHyperlinks': pct_ext_hyperlinks,
        'PctExtResourceUrls': pct_ext_resource_urls,
        'ExtFavicon': ext_favicon,
        'InsecureForms': insecure_forms,
        'RelativeFormAction': relative_form_action,
        'ExtFormAction': ext_form_action,
        'AbnormalFormAction': abnormal_form_action,
        'PctNullSelfRedirectHyperlinks': pct_null_self_redirect,
        'FrequentDomainNameMismatch': freq_domain_mismatch,
        'FakeLinkInStatusBar': fake_link_status,
        'RightClickDisabled': right_click_disabled,
        'PopUpWindow': popup_window,
        'SubmitInfoToEmail': submit_to_email,
        'IframeOrFrame': iframe_or_frame,
        'MissingTitle': missing_title,
        'ImagesOnlyInForm': images_only_form,
        'SubdomainLevelRT': subdomain_level_rt,
        'UrlLengthRT': url_len_rt,
        'PctExtResourceUrlsRT': pct_ext_resource_urls_rt,
        'AbnormalExtFormActionR': abnormal_ext_form_action_r,
        'ExtMetaScriptLinkRT': ext_meta_script_link_rt,
        'PctExtNullSelfRedirectHyperlinksRT': pct_ext_null_self_redirect_rt
    }

    # Return list in exact order of model features
    return [feature_dict[name] for name in feature_names_in]


spambase_words = [
    "make", "address", "all", "3d", "our", "over", "remove", "internet",
    "order", "mail", "receive", "will", "people", "report", "addresses",
    "free", "business", "email", "you", "credit", "your", "font", "000",
    "money", "hp", "hpl", "george", "650", "lab", "labs", "telnet", "857",
    "data", "415", "85", "technology", "1999", "parts", "pm", "direct",
    "cs", "meeting", "original", "project", "re", "edu", "table", "conference"
]

spambase_chars = [";", "(", "[", "!", "$", "#"]

# Map modern spam terms to semantic equivalents in Spambase features
SPAM_SYNONYMS = {
    "lottery": "money",
    "prize": "money",
    "claim": "free",
    "won": "free",
    "winner": "free",
    "urgent": "remove",
    "dollars": "money",
    "cash": "money"
}

def extract_email_features(email_text: str) -> list:
    raw_words = re.findall(r'[a-zA-Z0-9]+', email_text.lower())
    
    # Map synonyms to spambase words
    words = []
    for w in raw_words:
        words.append(w)
        if w in SPAM_SYNONYMS:
            words.append(SPAM_SYNONYMS[w])
            
    total_words = len(words)
    total_chars = len(email_text)
    
    word_freqs = []
    for w in spambase_words:
        if total_words > 0:
            count = words.count(w)
            freq = 100.0 * count / total_words
        else:
            freq = 0.0
        word_freqs.append(freq)
        
    char_freqs = []
    for c in spambase_chars:
        if total_chars > 0:
            count = email_text.count(c)
            freq = 100.0 * count / total_chars
        else:
            freq = 0.0
        char_freqs.append(freq)
        
    cap_runs = re.findall(r'[A-Z]+', email_text)
    if cap_runs:
        lengths = [len(r) for r in cap_runs]
        cap_average = sum(lengths) / len(lengths)
        cap_longest = max(lengths)
        cap_total = sum(lengths)
    else:
        cap_average = 0.0
        cap_longest = 0
        cap_total = 0
        
    return word_freqs + char_freqs + [cap_average, cap_longest, cap_total]

# ==========================
# Predictor Class
# ==========================

class Predictor:

    @staticmethod
    def _evaluate_prediction(model, features, class_labels) -> Tuple[str, float, int, str]:
        pred_class = int(model.predict([features])[0])
        prob = model.predict_proba([features])[0]
        
        prediction = class_labels[pred_class]
        confidence = float(prob[pred_class])
        
        # In all models, class 1 is malicious (Scam/Phishing/Spam) and class 0 is safe
        risk_score = int(float(prob[1]) * 100)
        severity = "Critical" if risk_score > 80 else "High" if risk_score > 60 else "Medium" if risk_score > 30 else "Safe"
        
        return prediction, confidence, risk_score, severity

    @staticmethod
    def predict_sms(message: str) -> Tuple[str, float, int, str]:
        if sms_model is None or sms_tfidf is None:
            raise FileNotFoundError("SMS model or TF-IDF vectorizer not loaded")
        
        X = sms_tfidf.transform([message])
        pred_class = int(sms_model.predict(X)[0])
        prob = sms_model.predict_proba(X)[0]
        
        class_labels = {0: "Safe", 1: "Scam"}
        prediction = class_labels[pred_class]
        confidence = float(prob[pred_class])
        risk_score = int(float(prob[1]) * 100)
        severity = "Critical" if risk_score > 80 else "High" if risk_score > 60 else "Medium" if risk_score > 30 else "Safe"
        
        return prediction, confidence, risk_score, severity

    @staticmethod
    def predict_email(content: str) -> Tuple[str, float, int, str]:
        if email_model is None:
            raise FileNotFoundError("Email model not loaded")
            
        features = extract_email_features(content)
        class_labels = {0: "Safe", 1: "Spam"}
        return Predictor._evaluate_prediction(email_model, features, class_labels)

    @staticmethod
    def predict_url(url: str) -> Tuple[str, float, int, str]:
        if url_model is None:
            raise FileNotFoundError("URL model not loaded")
            
        features = extract_url_features(url, url_model.feature_names_in_)
        class_labels = {0: "Legitimate", 1: "Phishing"}
        return Predictor._evaluate_prediction(url_model, features, class_labels)