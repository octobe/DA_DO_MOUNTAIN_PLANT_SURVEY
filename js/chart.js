const container = document.querySelector('.chartblock');
let chartCount = 0;
let data;

async function fetchData() {
  try {
    const response = await fetch('大肚山植調.csv');
    const csvData = await response.text();
    data = csvToObjects(csvData);
    addNewChart();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function addNewChart() {
  const newChartCount = chartCount + 1;
  const newChartContainer = document.createElement('div');
  newChartContainer.classList.add('chart-container');

  const newPlantSelector = document.createElement('select');
  newPlantSelector.id = `plantSelector${newChartCount}`;
  newPlantSelector.addEventListener('change', () => loadData(`chart${newChartCount}`));
  populateDropdown(newPlantSelector);

  const newYearSelector = document.createElement('select');
  newYearSelector.id = `yearSelector${newChartCount}`;
  newYearSelector.addEventListener('change', () => loadData(`chart${newChartCount}`));
  const uniqueYears = getUniqueYears();
  populateYearDropdown(newYearSelector, uniqueYears);

  const newResultDiv = document.createElement('div');
  newResultDiv.id = `result${newChartCount}`;

  const newChartDiv = document.createElement('div');
  newChartDiv.id = `chartContainer${newChartCount}`;
  newChartDiv.classList.add('chart');

  newChartContainer.appendChild(createLabel(`選擇植物：`, newPlantSelector));
  newChartContainer.appendChild(createLabel(`選擇年份：`, newYearSelector));
  newChartContainer.appendChild(newResultDiv);
  newChartContainer.appendChild(newChartDiv);

  container.insertBefore(newChartContainer, container.lastElementChild);

  chartCount++;

  loadData(`chart${newChartCount}`);
}

function createLabel(text, target) {
  const label = document.createElement('label');
  label.textContent = text;
  label.appendChild(target);
  return label;
}

function populateDropdown(selector) {
  const uniquePlantNumbers = new Set();

  data.forEach(item => {
    const plantNumber = item['植物編號'];
    const plantName = item['植物名稱'];

    if (plantNumber !== undefined && plantName !== undefined) {
      if (!uniquePlantNumbers.has(plantNumber)) {
        uniquePlantNumbers.add(plantNumber);

        const option = document.createElement('option');
        option.value = plantNumber;
        option.text = `${plantNumber} - ${plantName}`;
        selector.appendChild(option);
      }
    }
  });
}

function getUniqueYears() {
  const uniqueYears = new Set();
  data.forEach(item => {
    const date = new Date(item['日期']);
    if (!isNaN(date.getFullYear())) {
      uniqueYears.add(date.getFullYear());
    }
  });
  return Array.from(uniqueYears);
}

function populateYearDropdown(selector, years) {
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.text = year.toString();
    selector.appendChild(option);
  });
}

function loadData(chartId) {
  const selectedPlantNumber = getSelectedPlantNumber(chartId);
  const selectedYear = getSelectedYear(chartId);
  const selectedPlantData = data.filter(item => item['植物編號'] === selectedPlantNumber);

  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31);
  const allDates = getDates(startDate, endDate);

  const chartContainer = document.getElementById(`chartContainer${chartId.charAt(chartId.length - 1)}`);
  chartContainer.innerHTML = '';

  const labels = allDates.map((date, index, array) => {
    const formattedDate = formatDate(date);
    const correspondingData = findCorrespondingData(date);
    const xAxisLabel = `${formattedDate}\n${correspondingData.節氣}\n${correspondingData.候別}`;  
    // 判斷是否滿足條件，若是則設為空字串
    if (xAxisLabel.length === 12 && index !== 0 && index !== array.length - 1) {
      return null;
    }  
    return xAxisLabel;
  });  
  
  const leafScores = new Array(allDates.length).fill(null);
  const flowerScores = new Array(allDates.length).fill(null);
  const fruitScores = new Array(allDates.length).fill(null);

  selectedPlantData.forEach(item => {
    const date = new Date(item['日期']);
    const index = allDates.findIndex(d => d.getTime() === date.getTime());
    leafScores[index] = parseFloat(item['葉子分數']);
    flowerScores[index] = parseFloat(item['花的分數']);
    fruitScores[index] = parseFloat(item['果實分數']);
  });

  const canvas = document.createElement('canvas');
  canvas.id = `chart${chartId.charAt(chartId.length - 1)}`;
  chartContainer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '葉子分數',
          borderColor: 'rgba(75, 192, 192, 1)',
          data: leafScores,
          fill: false,
          spanGaps: true,
        },
        {
          label: '花的分數',
          borderColor: 'rgba(255, 99, 132, 1)',
          data: flowerScores,
          fill: false,
          spanGaps: true,
        },
        {
          label: '果實分數',
          borderColor: 'rgba(255, 205, 86, 1)',
          data: fruitScores,
          fill: false,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {            
        y: {
          max: 3,
          min: 0,
          ticks: {
            stepSize: 0.5,
            autoSkip: false,
          },
        },
      },
    },
  });
}

function findCorrespondingData(date) {
  const dateString = formatDate(date);
  const correspondingData = data.find(item => item['日期'] === dateString) || { 節氣: '', 候別: '' };
  return {
    節氣: correspondingData['節氣'],
    候別: correspondingData['候別'],
  };
}

function getDates(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

function getSelectedPlantNumber(chartId) {
  const selector = document.getElementById(`plantSelector${chartId.charAt(chartId.length - 1)}`);
  return selector.value;
}

function getSelectedYear(chartId) {
  const selector = document.getElementById(`yearSelector${chartId.charAt(chartId.length - 1)}`);
  return parseInt(selector.value);
}

function csvToObjects(csv) {
  csv = csv.replace(/\r\n/g, '\n');

  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j];
    }

    result.push(obj);
  }

  return result;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
}
function toggleChartDisplay() {
  const chartBlock = document.querySelector('.chartblock');
  const button = document.querySelector('.config.display button');
  
  chartBlock.classList.toggle('dual-display');
  
  if (chartBlock.classList.contains('dual-display')) {
    button.textContent = '單排顯示';
  } else {
    button.textContent = '併排顯示';
  }
}

// Call fetchData to initialize the existing chart
fetchData();
