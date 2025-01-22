document.addEventListener('DOMContentLoaded', () => {
  const addClassForm = document.getElementById('add-class-form');
  const timetableBody = document.getElementById('timetable-body');
  const contextMenu = document.getElementById('context-menu');
  let selectedCell = null;

  // 授業の追加
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

    cell.innerHTML = `<div><strong>${subject}</strong><br><span>${classroom}</span></div>`;

    // フォームのリセット
    addClassForm.reset();
  });

  // 右クリックメニューの表示
  timetableBody.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'TD' && e.target.innerHTML !== '') {
      selectedCell = e.target;
      contextMenu.style.display = 'block';
      contextMenu.style.left = `${e.pageX}px`;
      contextMenu.style.top = `${e.pageY}px`;
    }
  });

  // メニュー以外をクリックした場合にメニューを閉じる
  document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
  });

  // 授業の編集
  document.getElementById('edit-option').addEventListener('click', () => {
    if (selectedCell) {
      const content = selectedCell.innerHTML.split('<br>');
      const subject = content[0].replace('<strong>', '').replace('</strong>', '');
      const classroom = content[1].replace('<span>', '').replace('</span>', '');
      const newSubject = prompt('新しい授業名を入力してください:', subject);
      const newClassroom = prompt('新しい教室番号を入力してください:', classroom);

      if (newSubject && newClassroom) {
        selectedCell.innerHTML = `<div><strong>${newSubject}</strong><br><span>${newClassroom}</span></div>`;
      }
      contextMenu.style.display = 'none';
    }
  });

  // 授業の削除
  document.getElementById('delete-option').addEventListener('click', () => {
    if (selectedCell) {
      selectedCell.innerHTML = '';
      contextMenu.style.display = 'none';
    }
  });

  // 次の授業をハイライト
  function highlightNextClass() {
    const now = new Date();
    const currentDayIndex = now.getDay() - 1;
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    let nextClassCell = null;

    // 各曜日と時間帯をチェック
    for (let period = 1; period <= 5; period++) {
      const row = timetableBody.querySelector(`tr:nth-child(${period})`);
      const cell = row.querySelector(`td:nth-child(${currentDayIndex + 2})`);

      if (cell && cell.innerHTML) {
        const classTime = parseInt(cell.getAttribute('data-time'), 10);
        if (classTime > currentTime) {
          nextClassCell = cell;
          break;
        }
      }
    }

    // 次の授業があればハイライト
    if (nextClassCell) {
      const highlightedClass = timetableBody.querySelector('.highlight');
      if (highlightedClass) {
        highlightedClass.classList.remove('highlight');
      }
      nextClassCell.classList.add('highlight');
    }
  }

  // 初期化時に次の授業をハイライト
  highlightNextClass();
  setInterval(highlightNextClass, 60000); // 1分ごとに次の授業をハイライト
});
