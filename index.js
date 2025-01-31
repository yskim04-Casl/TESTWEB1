const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;


// POST로 받은 JSON을 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (public 폴더)
app.use(express.static("public"));

let signals = [];
// 아두이노에서 POST 요청하는 엔드포인트
app.post("/api/signal", (req, res) => {
	const { A, B, C } = req.body;

  // 받은 시각과 함께 저장
	signals.push({
		timestamp: Date.now(),
		A: A ?? 0,
		B: B ?? 0,
		C: C ?? 0,
	});

// 최대 크기 유지
	if (signals.length > 500) {
		signals.shift(); // 오래된 데이터 제거
	}
	res.status(200).json({ message: "Signal received" });
});

app.get("/api/signal", (req, res) => {
	if (signals.length === 0) {
    // 아직 들어온 신호가 없으면 0값을 하나 보냄
		return res.json({
		timestamp: Date.now(),
		A: 0,
		B: 0,
		C: 0
    });
  }
  // signals 배열의 마지막(가장 최근) 점을 반환
	const lastPoint = signals[signals.length - 1];
	res.json(lastPoint);
});

// 서버 실행
app.listen(PORT, () => {
	console.log(`Successfully opened the server:${PORT}`);
});
