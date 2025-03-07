let myChart;

// A/B/C 신호 활성화 상태
let activeSignals = {
	A: false,
	B: false,
	C: false,
};

// 페이지 로드 후 차트 초기화 + 2초마다 데이터 갱신
window.addEventListener("DOMContentLoaded", () => {
	initChart();
});

// 차트 생성
function initChart() {
	const ctx = document.getElementById("myChart").getContext("2d");
	myChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: [], // 이후 timestamps 변환하여 삽입
			datasets: [
			{
				label: "전류 [uA]",
				data: [],
				borderColor: "red",
				fill: false,
			},
			{
				label: "전압 [V]",
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

// 체크박스 클릭 시 호출
function updateGraph(signalKey) {
  // 토글
	activeSignals[signalKey] = !activeSignals[signalKey];
  // 다시 데이터 반영
	fetchAndUpdate();
}

// 전역 배열: 클라이언트에서 누적 관리
let clientData = {
	timestamps: [],
	A: [],
	B: [],
	C: []
};

const MAX_POINTS = 304;

async function fetchAndUpdate() {
  try {
    // 서버에서 데이터 가져오기
    const res = await fetch("https://testweb1-9gn3.onrender.com/api/signal");
    const newPoint = await res.json(); // 단일 객체를 바로 가져옴

    // 데이터 누적
    clientData.timestamps.push(newPoint.C);
    clientData.A.push(newPoint.A);
    clientData.B.push(newPoint.B);
    clientData.C.push(newPoint.C);

    // 오래된 데이터 제거
    if (clientData.timestamps.length > MAX_POINTS) {
      clientData.timestamps.shift();
      clientData.A.shift();
      clientData.B.shift();
      clientData.C.shift();
    }

    // 차트 라벨 업데이트 X축축
    myChart.data.labels = clientData.timestamps.map(ts =>
      new Date(ts).toLocaleTimeString()
    );

    // 차트 데이터 업데이트, Y축
    myChart.data.datasets[0].data = activeSignals.A
      ? clientData.A
      : clientData.A.map(() => null);
    myChart.data.datasets[1].data = activeSignals.B
      ? clientData.B
      : clientData.B.map(() => null);
    myChart.data.datasets[2].data = activeSignals.C
      ? clientData.C
      : clientData.C.map(() => null);

    myChart.update();
  } catch (err) {
    console.error("Error fetching or updating data:", err);
  }
}
