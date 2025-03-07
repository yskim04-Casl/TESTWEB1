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
      // x축 라벨: 기존 timestamps 대신 C 데이터를 x축 라벨로 사용
      labels: [],
      datasets: [
        {
          label: "전압 신호 [uA]",
          data: [],
          borderColor: "red",
          fill: false,
        },
        {
          label: "전류 신호 [V]",
          data: [],
          borderColor: "green",
          fill: false,
        },
        // 필요에 따라 '시간 신호' 데이터셋은 제거 가능
        {
          label: "시간 신호 [DEBUG]",
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
          title: { display: true, text: "Time[s]" },
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
  // 기존에 수신된 데이터 누적
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

// 활성 상태에 따라 전체 차트 데이터를 갱신하는 함수
function refreshChartData() {
  // x축 라벨을 clientData.C 값으로 설정 (C 데이터가 x축에 표시됨)
  myChart.data.labels = clientData.C;

  // 각 데이터셋 업데이트: 체크박스가 활성화되어 있을 경우 실제 데이터, 아니면 null로 채워서 플롯 제거
  myChart.data.datasets[0].data = activeSignals.A ? clientData.A : clientData.A.map(() => null);
  myChart.data.datasets[1].data = activeSignals.B ? clientData.B : clientData.B.map(() => null);
  // 만약 x축에 C 데이터를 사용하는 경우, '시간 신호' 데이터셋은 불필요하다면 제거 가능
  myChart.data.datasets[2].data = activeSignals.C ? clientData.C : clientData.C.map(() => null);

  myChart.update();
}
