/**
 * DISCORD 伺服器標籤票選系統 - 完全空白初始版
 * 初始無預設標籤 | 嚴格4字中文 | 零 EMOJI
 */

// 初始標籤清單完全為空，由用戶自行新增
const DEFAULT_CANDIDATES = [];

class TagBallotApp {
  constructor() {
    this.candidates = [];
    this.userVotes = new Set();
    this.previewTag = '伺服標籤';
    this.previewMode = 'clan'; // 'clan' | 'role'

    this.initStorage();
    this.bindDOMElements();
    this.bindEvents();
    this.render();
  }

  initStorage() {
    // 升級至 v4 命名空間，徹底清空過去所有預設標籤與快取
    const stored = localStorage.getItem('discord_tag_v4_candidates');
    if (stored) {
      try {
        this.candidates = JSON.parse(stored);
      } catch (e) {
        this.candidates = [];
      }
    } else {
      this.candidates = [];
      this.saveCandidates();
    }

    // 讀取用戶投票紀錄
    const storedVotes = localStorage.getItem('discord_tag_v4_user_votes');
    if (storedVotes) {
      try {
        this.userVotes = new Set(JSON.parse(storedVotes));
      } catch (e) {
        this.userVotes = new Set();
      }
    } else {
      this.userVotes = new Set();
      this.saveUserVotes();
    }

    // 如果目前有候選標籤，將預覽標籤設為第一個；如果沒有則顯示「伺服標籤」
    if (this.candidates.length > 0) {
      this.previewTag = this.candidates[0].name;
    }
  }

  saveCandidates() {
    localStorage.setItem('discord_tag_v4_candidates', JSON.stringify(this.candidates));
  }

  saveUserVotes() {
    localStorage.setItem('discord_tag_v4_user_votes', JSON.stringify([...this.userVotes]));
  }

  bindDOMElements() {
    this.previewTagBadge = document.getElementById('preview-tag-badge');
    this.modeTabs = document.querySelectorAll('.mode-tab');
    this.ballotGrid = document.getElementById('ballot-grid');
    this.candidateCount = document.getElementById('candidate-count');
    this.globalStatsPill = document.getElementById('global-stats-pill');

    this.proposeForm = document.getElementById('propose-form');
    this.tagInput = document.getElementById('tag-input');
    this.exportBtn = document.getElementById('export-btn');
  }

  bindEvents() {
    // 預覽器模式切換 (公會標籤 / 身分組標籤)
    this.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.previewMode = tab.dataset.mode;
        this.updatePreviewBadge();
      });
    });

    // 新增標籤表單
    this.proposeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleProposeTag();
    });

    // 複製排名結果
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => this.exportResults());
    }
  }

  /**
   * 驗證規則：
   * 1. 僅限中文（[\u4e00-\u9fa5]）
   * 2. 嚴格 4 個字
   * 3. 不能使用任何英文、數字或符號
   */
  validateChineseTag(rawText) {
    const cleaned = rawText.trim().replace(/^#+/, '').replace(/\s+/g, '');

    if (!cleaned) {
      return { valid: false, message: '請輸入標籤名稱。' };
    }

    if (/[a-zA-Z]/.test(cleaned)) {
      return { valid: false, message: '錯誤：不允許包含英文字母，必須全為中文。' };
    }

    if (/[0-9]/.test(cleaned)) {
      return { valid: false, message: '錯誤：不允許包含數字，必須全為中文。' };
    }

    if (/[^\u4e00-\u9fa5]/.test(cleaned)) {
      return { valid: false, message: '錯誤：不允許包含符號，必須全為中文。' };
    }

    if (cleaned.length !== 4) {
      return {
        valid: false,
        message: `錯誤：標籤必須「剛好 4 個中文字」（目前輸入為 ${cleaned.length} 個字）。`
      };
    }

    return { valid: true, text: cleaned };
  }

  handleProposeTag() {
    const check = this.validateChineseTag(this.tagInput.value);
    if (!check.valid) {
      alert(check.message);
      return;
    }

    const tagName = check.text;
    const exists = this.candidates.some(c => c.name === tagName);
    if (exists) {
      alert(`標籤 [#${tagName}] 已經存在於候選清單中。`);
      return;
    }

    const newCandidate = {
      id: 'tag_' + Date.now().toString(36),
      name: tagName,
      votes: 0,
      createdAt: Date.now()
    };

    // 新增至清單開頭
    this.candidates.unshift(newCandidate);
    this.saveCandidates();

    this.tagInput.value = '';
    this.previewTag = tagName;
    this.render();
  }

  handleVote(candidateId) {
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    if (this.userVotes.has(candidateId)) {
      // 取消投票
      this.userVotes.delete(candidateId);
      candidate.votes = Math.max(0, candidate.votes - 1);
    } else {
      // 投出此票
      this.userVotes.add(candidateId);
      candidate.votes += 1;
    }

    this.saveCandidates();
    this.saveUserVotes();
    this.render();
  }

  updatePreviewBadge() {
    this.previewTagBadge.className = `discord-tag-badge mode-${this.previewMode}`;
    if (this.previewMode === 'clan') {
      this.previewTagBadge.textContent = `[ ${this.previewTag} ]`;
    } else {
      this.previewTagBadge.textContent = `#${this.previewTag}`;
    }
  }

  renderBallotGrid() {
    const sorted = [...this.candidates].sort((a, b) => b.votes - a.votes || a.createdAt - b.createdAt);
    const totalVotes = this.candidates.reduce((sum, c) => sum + c.votes, 0);

    this.ballotGrid.innerHTML = '';

    if (sorted.length === 0) {
      this.ballotGrid.innerHTML = `
        <div class="empty-state">
          目前尚無任何候選標籤。<br>請在左側輸入 4 字中文標籤開始新增。
        </div>
      `;
      return;
    }

    sorted.forEach((item, index) => {
      const isVoted = this.userVotes.has(item.id);
      const isCurrentPreview = this.previewTag === item.name;
      const percentage = totalVotes > 0 ? ((item.votes / totalVotes) * 100).toFixed(1) : '0.0';
      const rankFormatted = String(index + 1).padStart(2, '0');

      const card = document.createElement('div');
      card.className = `tag-card ${isVoted ? 'is-voted' : ''} ${isCurrentPreview ? 'active-preview' : ''}`;
      card.dataset.id = item.id;

      card.innerHTML = `
        <div class="card-top-row">
          <div class="card-tag-identity">
            <span class="rank-index">${rankFormatted}</span>
            <span class="tag-name">#${item.name}</span>
          </div>
          <button class="vote-action-btn" data-action="vote" data-id="${item.id}">
            ${isVoted ? '[ 已投票 ]' : '[ 投票 ]'}
          </button>
        </div>

        <div class="card-progress-row">
          <div class="progress-track">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="progress-metrics">
            <span class="metric-pct">${percentage}%</span>
            <span class="metric-votes">${item.votes} 票</span>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="vote"]')) {
          this.handleVote(item.id);
        } else {
          this.previewTag = item.name;
          this.updatePreviewBadge();
          document.querySelectorAll('.tag-card').forEach(c => c.classList.remove('active-preview'));
          card.classList.add('active-preview');
        }
      });

      this.ballotGrid.appendChild(card);
    });
  }

  render() {
    const totalVotes = this.candidates.reduce((sum, c) => sum + c.votes, 0);

    this.candidateCount.textContent = `${this.candidates.length} 個標籤`;
    this.globalStatsPill.textContent = `總票數：${totalVotes}`;

    this.renderBallotGrid();
    this.updatePreviewBadge();
  }

  exportResults() {
    if (this.candidates.length === 0) {
      alert('目前尚無任何標籤可供匯出。');
      return;
    }

    const sorted = [...this.candidates].sort((a, b) => b.votes - a.votes);
    const totalVotes = this.candidates.reduce((sum, c) => sum + c.votes, 0);

    let output = '=== DISCORD 伺服器標籤票選結果 ===\n';
    output += `總得票數：${totalVotes} 票 | 候選標籤數：${this.candidates.length}\n`;
    output += '------------------------------------\n';

    sorted.forEach((c, i) => {
      const pct = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : '0.0';
      const rank = String(i + 1).padStart(2, '0');
      output += `${rank}. #${c.name}  ${c.votes} 票 (${pct}%)\n`;
    });

    output += '------------------------------------\n';

    navigator.clipboard.writeText(output).then(() => {
      const originalText = this.exportBtn.textContent;
      this.exportBtn.textContent = '[ 已複製結果 ]';
      setTimeout(() => {
        this.exportBtn.textContent = originalText;
      }, 2000);
    }).catch(() => {
      alert(output);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TagBallotApp();
});
