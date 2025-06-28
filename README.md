# LibreTrac 📊🧠

## ✨ Features

* **Mood & cognition journal**  
* **Cognitive mini-tests** (reaction-time, N-back, Stroop, digit span…)
* **Sleep log** – dual-axis charts for hours & quality  
* **Stack manager** (meds & nootropics) with:
  * AI-generated safety summaries  
  * Real-time interaction warnings (OpenAI)  
* **Trend analytics**
* **Fully offline** – SQLite (Drift) + Riverpod + Hive prefs  
* **Dark theme**
* **100 % open source** – GPL‑3

---

## 🚀 Quick start

```bash
git clone https://github.com/billyrigdon/libretrac.git
cd libretrac
flutter pub get
```

### 1. Add your OpenAI API key

1. Create a file at **`assets/.env`** (ignored by git).  
2. Add a single line:

   ```env
   api_key=sk-********************************
   ```

3. That’s it — `OpenAIAPI.instance` reads the key at runtime.

### 2. Run on Android

```bash
flutter run
```

## 🤝 Contributing

PRs welcome!  Open an issue for ideas or bugs.  
Please run `flutter analyze` and `dart format .` before submitting.

---

## 🪪 License

GPL‑3.0 — see [`LICENSE`](LICENSE).  
Use freely, attribute, and share improvements alike.

---
