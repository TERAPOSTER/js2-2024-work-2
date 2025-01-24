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
  const resetButton = document.getElementById('reset-button');

  resetButton.addEventListener('click', () => {
    // テーブル内の全セルをクリア
    timetableBody.querySelectorAll('td').forEach(cell => {
      cell.innerHTML = '';
      cell.removeAttribute('data-time'); // data-time属性も削除
      // ハイライトの削除
      timetableBody.querySelectorAll('.highlight').forEach(cell => cell.classList.remove('highlight'));
      // 保存された時間割データを削除
      localStorage.removeItem('timetable');  // localStorageに保存しているデータを削除
    });

    // // ハイライトの削除
    // timetableBody.querySelectorAll('.highlight').forEach(cell => cell.classList.remove('highlight'));
    //  // 保存された時間割データを削除
    // localStorage.removeItem('timetableData');  // localStorageに保存しているデータを削除
  });


  // 時間割データを保存
  function saveTimetable() {
    const timetable = [];
    const rows = document.querySelectorAll(".timetable-row");

    rows.forEach((row, rowIndex) => {
        const rowData = [];
        row.querySelectorAll("td").forEach((cell, cellIndex) => {
            // 時間帯ラベル（例: "1限", "2限"）を除外
            if (cellIndex === 0) {
                rowData.push(null); // ラベル用セルはnullで保存
            } else {
                rowData.push({
                    content: cell.innerHTML.trim() || null, // 内容がなければnull
                    time: cell.dataset.time || null, // 必要ならtime属性も保存
                });
            }
        });
        timetable.push(rowData);
    });

    localStorage.setItem("timetable", JSON.stringify(timetable));
  }



  // 時間割データを保存
  function saveTimetable() {
    const timetable = [];
    const rows = document.querySelectorAll("tr"); // tr要素を直接取得

    rows.forEach((row, rowIndex) => {
      const rowData = [];
      row.querySelectorAll("td").forEach((cell, cellIndex) => {
        if (cellIndex === 0) {
          rowData.push(null); // 時間帯ラベル用セルはnullで保存
        } else {
          rowData.push({
            content: cell.innerHTML.trim() || null, // 内容がなければnull
            time: cell.dataset.time || null, // 必要ならtime属性も保存
          });
        }
      });
      timetable.push(rowData);
    });

    localStorage.setItem("timetable", JSON.stringify(timetable));
  }

  // 時間割データを復元
  function loadTimetable() {
    const timetable = JSON.parse(localStorage.getItem("timetable"));
    if (!timetable) return;

    const rows = document.querySelectorAll("tr"); // tr要素を直接取得

    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll("td");

      cells.forEach((cell, cellIndex) => {
        if (cellIndex === 0) {
          // 時間帯ラベルを設定
          cell.innerHTML = `${rowIndex + 1}限`;
        } else {
          const cellData = timetable[rowIndex]?.[cellIndex];
          if (cellData) {
            cell.innerHTML = cellData.content || ""; // 内容を設定
            if (cellData.time) {
              cell.dataset.time = cellData.time; // 必要ならtime属性も復元
            }
          } else {
            cell.innerHTML = ""; // 空の場合
          }
        }
      });
    });
  }


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
    if (!cell.hasAttribute('data-time')) { // すでに授業が設定されていない場合のみ追加
      cell.innerHTML = `<div><strong>${subject}</strong><br><span>${classroom}</span></div>`;
      cell.setAttribute('data-time', period); // 授業時間データを設定
    }

    // フォームのリセット
    addClassForm.reset();

    // 保存とハイライト更新
    saveTimetable();
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

  // 初期化
  loadTimetable();
  highlightNextClass();
  setInterval(highlightNextClass, 60000);

  // ニュースの取得と表示
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

  // ニュースの初期化
  fetchAndDisplayNews();
});
