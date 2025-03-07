let myChart;

// A/B/C 신호 활성화 상태
let activeSignals = {
  A: true, // 데모용이므로 기본적으로 모두 활성화로 설정 가능
  B: true,
  C: true,
};

// 차트 초기화 (페이지 로드 시)
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
      labels: [], // 시간 데이터
      datasets: [
        {
          label: "전압 [V]",
          data: [],
          borderColor: "red",
          fill: false,
        },
        {
          label: "전류 [uA]",
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

// SSE 초기화 및 이벤트 핸들러 등록
function initSSE() {
  const eventSource = new EventSource("https://testweb1-9gn3.onrender.com/api/signal/stream"); // 도메인/포트를 실제 서버에 맞게 수정
  eventSource.onmessage = (event) => {
    const newSignal = JSON.parse(event.data);
    updateChart(newSignal);
  };
  eventSource.onerror = (err) => {
    console.error("SSE 연결 에러", err);
  };
}

// 차트 업데이트: 새로운 신호가 들어올 때마다 호출
function updateChart(newSignal) {
  // 기존 데이터 배열에 추가
  myChart.data.labels.push(new Date(newSignal.timestamp).toLocaleTimeString());
  myChart.data.datasets[0].data.push(activeSignals.A ? newSignal.A : null);
  myChart.data.datasets[1].data.push(activeSignals.B ? newSignal.B : null);
  myChart.data.datasets[2].data.push(activeSignals.C ? newSignal.C : null);

  // 최대 데이터 포인트 제한 (예시로 304 포인트)
  const MAX_POINTS = 304;
  if (myChart.data.labels.length > MAX_POINTS) {
    myChart.data.labels.shift();
    myChart.data.datasets.forEach(dataset => dataset.data.shift());
  }
  
  myChart.update();
}
