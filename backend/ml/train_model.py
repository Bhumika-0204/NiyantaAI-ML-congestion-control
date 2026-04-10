import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
import joblib

# -------------------- LOAD DATA --------------------
data = pd.read_csv("../data/network_data.csv")

features = [
    "incoming_rate",
    "queue_length",
    "sent_packets",
    "dropped_packets"
]

X = data[features]
y = data["congestion"]

# -------------------- SPLIT --------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# -------------------- PREPROCESSING & MODEL --------------------
# Using a Pipeline to scale features, then Random Forest for better nonlinear pattern matching
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", RandomForestClassifier(n_estimators=100, max_depth=10, class_weight="balanced", random_state=42, n_jobs=-1))
])

# -------------------- TRAIN --------------------
pipeline.fit(X_train, y_train)

# -------------------- EVALUATE --------------------
y_prob = pipeline.predict_proba(X_test)[:, 1]
threshold = 0.6  # Tunable threshold to reduce false negatives
y_pred = (y_prob >= threshold).astype(int)

acc = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

print("Accuracy:", acc)
print("ROC-AUC Score:", roc_auc)
print(f"Threshold used: {threshold}")
print("\nConfusion Matrix:")
print("Focus on false negatives (missing actual congestion events):")
print(confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# -------------------- SAVE TRAINED PIPELINE --------------------
joblib.dump({
    "model": pipeline,
    "features": features
}, "congestion_model.pkl")
print("\nModel pipeline and feature metadata saved as congestion_model.pkl")
