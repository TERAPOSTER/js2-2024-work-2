document.addEventListener('DOMContentLoaded', () => {
  const timetableBody = document.getElementById('timetable-body');
  const addClassForm = document.getElementById('add-class-form');
  const contextMenu = document.getElementById('context-menu');
  let selectedCell = null;

  // 各授業時間（固定）
  const classTimes = {
    1: [900, 1030],  // 1限 9:00-10:30
    2: [1040, 1210], // 2限 10:40-12:10
    3: [1300, 1430], // 3限 13:00-14:30
    4: [1440, 1610], // 4限 14:40-16:10
    5: [1620, 1750], // 5限 16:20-17:50
  };

  // 授業追加
  addClassForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const day = document.getElementById('day').value;
    const period = parseInt(document.getElementById('period').value, 10);
    const subject = document.getElementById('subject').value;
    const classroom = document.getElementById('classroom').value;
  
    // テーブルの該当するセルに授業を追加
    const dayIndex = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日'].indexOf(day) + 1;
    const row = timetableBody.querySelector(`tr:nth-child(${period})`);
    const cell = row.querySelector(`td:nth-child(${dayIndex + 1})`);
  
    // 追加する授業内容を設定
    cell.innerHTML = `<div><strong>${subject}</strong><br><span>${classroom}</span></div>`;
    cell.setAttribute('data-time', period); // 授業時間データを設定
  
    // フォームのリセット
    addClassForm.reset();
  
    // ハイライト更新を呼び出す
    highlightNextClass();
  });
  

  // 次の授業をハイライト
  function highlightNextClass() {
    const now = new Date();
    const currentDayIndex = now.getDay() - 1; // 月曜日=0, 金曜日=4
    const currentTime = now.getHours() * 100 + now.getMinutes();
    let nextClassCell = null;

    // 現在の曜日から順に授業を確認
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const dayIndex = (currentDayIndex + dayOffset) % 5;

      for (let period = 1; period <= 5; period++) {
        const [start, end] = classTimes[period];
        const row = timetableBody.querySelector(`tr:nth-child(${period})`);
        const cell = row.querySelector(`td:nth-child(${dayIndex + 2})`);

        if (dayOffset === 0 && currentTime < start && cell && cell.innerHTML) {
          nextClassCell = cell;
          break;
        } else if (dayOffset > 0 && cell && cell.innerHTML) {
          nextClassCell = cell;
          break;
        }
      }
      if (nextClassCell) break;
    }

    // ハイライト更新
    timetableBody.querySelectorAll('.highlight').forEach(cell => cell.classList.remove('highlight'));
    if (nextClassCell) nextClassCell.classList.add('highlight');
  }

  // 1分ごとに次の授業をチェック
  highlightNextClass();
  setInterval(highlightNextClass, 60000);
});


const newsContainer = document.querySelector('#news-container'); // ニュースを表示する場所

async function fetchAndDisplayNews() {
  try {
    const response = await fetch('/api/news'); // バックエンドのAPIエンドポイント
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      const randomArticle = data.articles[Math.floor(Math.random() * data.articles.length)];

      const newsTitle = document.createElement('a');
      newsTitle.href = randomArticle.url;
      newsTitle.textContent = randomArticle.title;
      newsTitle.target = '_blank';
      newsTitle.style.textDecoration = 'none';
      newsTitle.style.color = '#000';

      newsContainer.innerHTML = ''; // 既存のニュースをクリア
      newsContainer.appendChild(newsTitle);
    } else {
      newsContainer.textContent = 'ニュースが見つかりませんでした。';
    }
  } catch (error) {
    console.error('ニュース取得エラー:', error);
    newsContainer.textContent = 'ニュースを取得できませんでした。';
  }
}

// 初期化
fetchAndDisplayNews();
