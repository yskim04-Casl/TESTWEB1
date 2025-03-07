let myChart;

// A/B/C 신호 활성화 상태 (기본 ON)
let activeSignals = {
  A: true,
  B: true,
  C: true,
};

// 수신된 데이터 저장 (SSE로 받은 신호들을 누적)
let clientData = {
  timestamps: [],
  A: [],
  B: [],
  C: []
};

const MAX_POINTS = 304;

// 페이지 로드 후 초기화
window.addEventListener("DOMContentLoaded", () => {
  initChart();
  initSSE();
});

// 차트 생성 함수
function initChart() {
  const ctx = document.getElementById("myChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [], // X축 라벨 (시간)
      datasets: [
        {
          label: "전압 [uA]",
          data: [],
          borderColor: "red",
          fill: false,
        },
        {
          label: "전류 [V]",
          data: [],
          borderColor: "green",
          fill: false,
        },
        {
          label: "시간 [s]",
          data: [],
          borderColor: "blue",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: "Time" },
        },
        y: {
          title: { display: true, text: "Value" },
        },
      },
    },
  });
}

// SSE 초기화 및 데이터 수신
function initSSE() {
  const eventSource = new EventSource("https://testweb1-9gn3.onrender.com/api/signal/stream"); // 실제 서버 주소로 수정
  eventSource.onmessage = (event) => {
    const newSignal = JSON.parse(event.data);
    updateChart(newSignal);
  };
  eventSource.onerror = (err) => {
    console.error("SSE 연결 에러", err);
  };
}

// 신규 신호 수신 시 처리: 데이터를 누적하고 차트 갱신
function updateChart(newSignal) {
  // 데이터 누적
  clientData.timestamps.push(newSignal.timestamp);
  clientData.A.push(newSignal.A);
  clientData.B.push(newSignal.B);
  clientData.C.push(newSignal.C);

  // 최대 데이터 포인트 제한
  if (clientData.timestamps.length > MAX_POINTS) {
    clientData.timestamps.shift();
    clientData.A.shift();
    clientData.B.shift();
    clientData.C.shift();
  }
  refreshChartData();
}

// 체크박스 클릭 시 호출: 해당 신호의 활성 상태를 현재 체크 여부로 설정
function updateGraph(signalKey, checkboxElem) {
  activeSignals[signalKey] = checkboxElem.checked;
  refreshChartData();
}

// 체크박스 활성 상태에 따라 전체 차트 데이터를 갱신
function refreshChartData() {
  // X축 라벨 갱신 (시간)
  myChart.data.labels = clientData.timestamps.map(ts => new Date(ts).toLocaleTimeString());

  // 각 데이터셋을 체크박스 활성 여부에 따라 업데이트:
  // 활성일 경우 실제 데이터, 비활성일 경우 null로 채워 차트에 표시하지 않음
  myChart.data.datasets[0].data = activeSignals.A ? clientData.A : clientData.A.map(() => null);
  myChart.data.datasets[1].data = activeSignals.B ? clientData.B : clientData.B.map(() => null);
  myChart.data.datasets[2].data = activeSignals.C ? clientData.C : clientData.C.map(() => null);

  myChart.update();
}
