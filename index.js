const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let signals = [];         // 수신된 신호 저장 (최대 55개 유지, 필요에 따라 변경 가능)
let sseClients = [];      // SSE 연결된 클라이언트를 저장하는 배열

// SSE 엔드포인트: 클라이언트와 지속적인 연결 유지
app.get('/api/signal/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  console.log(`SSE 클라이언트 연결됨. 총 연결: ${sseClients.length}`);

  req.on('close', () => {
    console.log('SSE 클라이언트 연결 종료');
    sseClients = sseClients.filter(client => client !== res);
  });
});

// POST 요청: 신호 저장 후 즉시 SSE를 통해 전송
app.post("/api/signal", (req, res) => {
  const { A, B, C } = req.body;
  const newSignal = {
    timestamp: Date.now(),
    A: A ?? 0,
    B: B ?? 0,
    C: C ?? 0,
  };

  // 신호 저장 (최대 55개 유지)
  signals.push(newSignal);
  if (signals.length > 55) {
    signals.shift();
  }

  // 연결된 모든 클라이언트에 실시간 데이터 전송
  sseClients.forEach(client => {
    client.write(`data: ${JSON.stringify(newSignal)}\n\n`);
  });

  res.status(200).json({ message: "Signal received" });
});

// (옵션) 기존 GET 엔드포인트 - 폴링 방식과의 호환을 위해 남겨둘 수 있음
app.get("/api/signal", (req, res) => {
  if (signals.length === 0) {
    return res.json({
      timestamp: Date.now(),
      A: 0,
      B: 0,
      C: 0,
    });
  }
  const lastPoint = signals[signals.length - 1];
  res.json(lastPoint);
});

app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
