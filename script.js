// 競馬使いすぎ防止サポーター AI (V5)

document.addEventListener('DOMContentLoaded', () => {

    // DOM
    const modeSetupSection = document.getElementById('mode-setup-section');
    const budgetSetupSection = document.getElementById('budget-setup-section');
    const mainAppContent = document.getElementById('main-app-content');
    const finishSummaryCard = document.getElementById('finish-summary-card');
    const inputCard = document.getElementById('input-card');
    const raceSetupView = document.getElementById('race-setup-view');
    const raceWaitingView = document.getElementById('race-waiting-view');
    const budgetForm = document.getElementById('budget-form');
    const budgetInput = document.getElementById('budget-input');
    const displayBudgetEl = document.getElementById('display-budget');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressStatus = document.getElementById('progress-status');
    const totalInvestmentEl = document.getElementById('total-investment');
    const totalReturnEl = document.getElementById('total-return');
    const totalBalanceEl = document.getElementById('total-balance');
    const cardTotalBalance = document.getElementById('card-total-balance');
    const raceNameInput = document.getElementById('race-name');
    const horseCountInput = document.getElementById('horse-count');
    const ticketInvestmentInput = document.getElementById('ticket-investment');
    const ticketOddsInput = document.getElementById('ticket-odds');
    const btnAddTicket = document.getElementById('btn-add-ticket');
    const horseSelectionArea = document.getElementById('horse-selection-area');
    const horseGrid = document.getElementById('horse-grid');
    const selectionInstruction = document.getElementById('selection-instruction');
    const selectionPreview = document.getElementById('selection-preview');
    const ticketAmountRow = document.getElementById('ticket-amount-row');
    const addedTicketsList = document.getElementById('added-tickets-list');
    const noTicketsMsg = document.getElementById('no-tickets-msg');
    const preDiagnoseArea = document.getElementById('pre-diagnose-area');
    const preTotalInvestmentEl = document.getElementById('pre-total-investment');
    const preSyntheticOddsEl = document.getElementById('pre-synthetic-odds');
    const trigamiWarning = document.getElementById('trigami-warning');
    const trigamiWarningText = document.getElementById('trigami-warning-text');
    const btnConfirmPurchase = document.getElementById('btn-confirm-purchase');
    const btnFinishDay = document.getElementById('btn-finish-day');
    const waitingRaceName = document.getElementById('waiting-race-name');
    const purchasedTicketsList = document.getElementById('purchased-tickets-list');
    const waitingTotalInvestment = document.getElementById('waiting-total-investment');
    const waitingCalculatedReturn = document.getElementById('waiting-calculated-return');
    const btnSubmitResult = document.getElementById('btn-submit-result');
    const btnCancelRace = document.getElementById('btn-cancel-race');
    const aiAvatar = document.getElementById('ai-avatar');
    const aiAdvice = document.getElementById('ai-advice');
    const aiLoader = document.getElementById('ai-loader');
    const loaderStep = document.getElementById('loader-step');
    const resultCard = document.getElementById('result-card');
    const resultTitle = document.getElementById('result-title');
    const resultIncome = document.getElementById('result-income');
    const radarControl = document.getElementById('radar-control');
    const radarEfficiency = document.getElementById('radar-efficiency');
    const radarRisk = document.getElementById('radar-risk');
    const radarMind = document.getElementById('radar-mind');
    const finishBalanceEl = document.getElementById('finish-balance');
    const finishRecoveryRateEl = document.getElementById('finish-recovery-rate');
    const finishRaceCountEl = document.getElementById('finish-race-count');
    const finishAiAdviceEl = document.getElementById('finish-ai-advice');
    const btnResetDay = document.getElementById('btn-reset-day');
    const historyList = document.getElementById('history-list');
    const btnClearHistory = document.getElementById('btn-clear-history');
    const noHistoryMsg = document.getElementById('no-history-msg');
    const btnConfirmMode = document.getElementById('btn-confirm-mode');
    const selectedModeIndicator = document.getElementById('selected-mode-indicator');
    const modeBadgeDisplay = document.getElementById('mode-badge-display');

    // State
    let budget = 0;
    let history = [];
    let isFinished = false;
    let isTyping = false;
    let keibaChart = null;
    let gameMode = null;
    let currentRace = { raceName: '', horseCount: 16, tickets: [], status: 'setup' };

    const MODE_CONFIG = {
        enjoy:   { label: '🌸 楽しむ',     icon: '🌸', cssClass: 'enjoy' },
        balance: { label: '⚖️ バランス',   icon: '⚖️', cssClass: 'balance' },
        win:     { label: '🎯 勝ちにいく', icon: '🎯', cssClass: 'win' }
    };

    // --- モード選択 ---
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gameMode = btn.dataset.mode;
            btnConfirmMode.disabled = false;
        });
    });

    btnConfirmMode.addEventListener('click', () => {
        if (!gameMode) return;
        modeSetupSection.classList.add('hidden');
        budgetSetupSection.classList.remove('hidden');
        const cfg = MODE_CONFIG[gameMode];
        selectedModeIndicator.innerHTML = `<span class="mode-badge-pill ${cfg.cssClass}">${cfg.label} が選択されています</span>`;
    });

    function renderModeBadge() {
        if (!gameMode) return;
        const cfg = MODE_CONFIG[gameMode];
        modeBadgeDisplay.innerHTML = `<span class="mode-badge-pill ${cfg.cssClass}">${cfg.icon} ${cfg.label}</span>`;
    }

    // --- Storage ---
    function resetCurrentRace() {
        currentRace = { raceName: '', horseCount: 16, tickets: [], status: 'setup' };
    }

    function saveData() {
        localStorage.setItem('keiba_v5_budget', budget.toString());
        localStorage.setItem('keiba_v5_history', JSON.stringify(history));
        localStorage.setItem('keiba_v5_finished', isFinished ? 'true' : 'false');
        localStorage.setItem('keiba_v5_current_race', JSON.stringify(currentRace));
        if (gameMode) localStorage.setItem('keiba_v5_mode', gameMode);
    }

    function loadData() {
        const storedBudget = localStorage.getItem('keiba_v5_budget');
        const storedMode   = localStorage.getItem('keiba_v5_mode');

        if (storedBudget && storedMode) {
            budget   = parseInt(storedBudget, 10);
            gameMode = storedMode;
            displayBudgetEl.textContent = `¥${budget.toLocaleString()}`;

            modeSetupSection.classList.add('hidden');
            budgetSetupSection.classList.add('hidden');
            mainAppContent.classList.remove('hidden');
            renderModeBadge();

            try { history = JSON.parse(localStorage.getItem('keiba_v5_history') || '[]'); } catch(e){ history=[]; }
            if (localStorage.getItem('keiba_v5_finished') === 'true') isFinished = true;
            try { currentRace = JSON.parse(localStorage.getItem('keiba_v5_current_race') || 'null') || { raceName:'', horseCount:16, tickets:[], status:'setup' }; } catch(e){ resetCurrentRace(); }

            updateDashboard(); renderHistory(); initOrUpdateChart(); renderCurrentRace();
            if (isFinished) lockAppForFinish(); else updateAiMoodBasedOnOverall();
        } else {
            modeSetupSection.classList.remove('hidden');
            budgetSetupSection.classList.add('hidden');
            mainAppContent.classList.add('hidden');
        }
    }

    // --- 予算設定 ---
    budgetForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!gameMode) return;
        const value = parseInt(budgetInput.value, 10);
        if (isNaN(value) || value <= 0) return;

        budget = value;
        isFinished = false;
        history = [];
        resetCurrentRace();
        displayBudgetEl.textContent = `¥${budget.toLocaleString()}`;
        saveData();

        budgetSetupSection.classList.add('hidden');
        mainAppContent.classList.remove('hidden');
        renderModeBadge();

        const msg = {
            enjoy:   `本日の予算 ¥${budget.toLocaleString()} でスタート！🌸 今日は損失上限を意識しながら楽しもう。無理せずマイペースでね！`,
            balance: `本日の予算 ¥${budget.toLocaleString()} でサポーターAIを起動しました。馬券を登録して診断を開始しましょう！`,
            win:     `予算 ¥${budget.toLocaleString()} で起動。勝ちにいくモード。回収率・期待値を意識し、データに基づいた冷静な判断を。感情での追い賭けは厳禁。`
        }[gameMode];

        aiAvatar.className = 'ai-avatar';
        aiAvatar.textContent = gameMode === 'enjoy' ? '🌸' : gameMode === 'win' ? '🎯' : '🤖';
        aiAdvice.textContent = msg;
        updateDashboard(); renderHistory(); initOrUpdateChart(); renderCurrentRace();
    });

    // --- Dashboard ---
    function updateDashboard() {
        let totalInvestment = 0, totalReturn = 0;
        history.forEach(i => { totalInvestment += i.investment; totalReturn += i.returnAmt; });
        if (currentRace && currentRace.status === 'waiting') {
            totalInvestment += currentRace.tickets.reduce((s, t) => s + t.investment, 0);
        }
        const totalBalance = totalReturn - totalInvestment;
        totalInvestmentEl.textContent = `¥${totalInvestment.toLocaleString()}`;
        totalReturnEl.textContent     = `¥${totalReturn.toLocaleString()}`;
        totalBalanceEl.textContent    = `¥${totalBalance > 0 ? '+' : ''}${totalBalance.toLocaleString()}`;
        cardTotalBalance.className = 'summary-card' + (totalBalance > 0 ? ' status-win' : totalBalance < 0 ? ' status-lose' : '');

        const loss = totalInvestment - totalReturn;
        const lossRatio = budget > 0 ? Math.max(0, (loss / budget) * 100) : 0;
        progressBar.style.width = `${Math.min(100, lossRatio)}%`;
        progressPercentage.textContent = `${Math.round(lossRatio)}%`;

        if      (lossRatio <= 0)   { progressStatus.textContent='安全：利益が出ているか、トントンです 📈';            progressStatus.style.color='var(--win-color)';  progressBar.style.background='linear-gradient(90deg,#10b981,#34d399)'; }
        else if (lossRatio <= 20)  { progressStatus.textContent='注意レベル1：微損です。まだ十分立て直せます。';      progressStatus.style.color='#a7f3d0';           progressBar.style.background='#059669'; }
        else if (lossRatio <= 40)  { progressStatus.textContent='注意レベル2：予算の40%を突破。賭け金を見直しましょう。'; progressStatus.style.color='var(--warn-color)'; progressBar.style.background='linear-gradient(90deg,#10b981,#fbbf24)'; }
        else if (lossRatio <= 60)  { progressStatus.textContent='注意レベル3：予算の半分を失いました！危険水域です。'; progressStatus.style.color='#f59e0b';          progressBar.style.background='#f59e0b'; }
        else if (lossRatio <= 80)  { progressStatus.textContent='警告レベル4：予算の80%に到達。次の敗北は致命的です！'; progressStatus.style.color='#f87171';         progressBar.style.background='linear-gradient(90deg,#f59e0b,#ef4444)'; }
        else if (lossRatio < 100)  { progressStatus.textContent='警告レベル5：軍資金がほぼ底をつきかけています！';   progressStatus.style.color='var(--danger-color)'; progressBar.style.background='#dc2626'; }
        else                       { progressStatus.textContent='緊急事態：設定予算を完全にオーバーしました！即終了してください 🚨'; progressStatus.style.color='var(--danger-color)'; progressBar.style.background='#ef4444'; progressBar.style.boxShadow='0 0 10px rgba(239,68,68,0.8)'; }
    }

    function getOverallLoss() {
        let inv = 0, ret = 0;
        history.forEach(i => { inv += i.investment; ret += i.returnAmt; });
        return Math.max(0, inv - ret);
    }

    // --- History ---
    function renderHistory() {
        historyList.innerHTML = '';
        if (history.length === 0) { noHistoryMsg.style.display='block'; btnClearHistory.disabled=true; return; }
        noHistoryMsg.style.display = 'none';
        btnClearHistory.disabled = isFinished;

        [...history].reverse().forEach(item => {
            const detailId = `detail-${item.id}`;
            const trP = document.createElement('tr');
            trP.className = 'history-parent-row';

            const diff = item.returnAmt - item.investment;
            const sign = diff > 0 ? '+' : '';

            trP.innerHTML = `
                <td>${item.time}</td>
                <td>${item.raceName||'一般レース'} <span class="accordion-icon">▼</span></td>
                <td>¥${item.investment.toLocaleString()}</td>
                <td>¥${item.returnAmt.toLocaleString()}</td>
                <td class="col-income ${diff>0?'plus':diff<0?'minus':''}">¥${sign}${diff.toLocaleString()}</td>
                <td style="text-align:center"></td>`;

            const delBtn = document.createElement('button');
            delBtn.className = 'btn-delete-row'; delBtn.innerHTML = '&times;'; delBtn.disabled = isFinished;
            delBtn.addEventListener('click', e => { e.stopPropagation(); deleteHistoryItem(item.id); });
            trP.cells[5].appendChild(delBtn);

            trP.addEventListener('click', () => {
                const dr = document.getElementById(detailId);
                if (!dr) return;
                const wasHidden = dr.classList.contains('hidden');
                document.querySelectorAll('.history-detail-row').forEach(r => r.classList.add('hidden'));
                document.querySelectorAll('.history-parent-row').forEach(p => p.classList.remove('active'));
                if (wasHidden) { dr.classList.remove('hidden'); trP.classList.add('active'); }
            });

            const trD = document.createElement('tr');
            trD.id = detailId; trD.className = 'history-detail-row hidden';
            const td = document.createElement('td'); td.colSpan = 6;
            const box = document.createElement('div'); box.className = 'detail-tickets-box';

            (item.tickets || []).forEach(t => {
                const retVal = t.isWon ? Math.round(t.investment * t.odds) : 0;
                const div = document.createElement('div'); div.className = 'detail-ticket-item';
                div.innerHTML = `<span class="ticket-status ${t.isWon?'won':'lost'}">${t.isWon?'的中':'不的中'}</span><span class="ticket-name">${t.betName}</span><span class="ticket-odds">オッズ: ${t.odds.toFixed(1)}倍</span><span class="ticket-amt">購入: ¥${t.investment.toLocaleString()}</span><span class="ticket-ret ${retVal>0?'won-amt':''}">払戻: ¥${retVal.toLocaleString()}</span>`;
                box.appendChild(div);
            });

            td.appendChild(box); trD.appendChild(td);
            historyList.appendChild(trP); historyList.appendChild(trD);
        });
    }

    function deleteHistoryItem(id) {
        if (isFinished) return;
        history = history.filter(i => i.id !== id);
        saveData(); updateDashboard(); renderHistory(); initOrUpdateChart(); updateAiMoodBasedOnOverall();
    }

    btnClearHistory.addEventListener('click', () => {
        if (history.length === 0 || isFinished) return;
        if (!confirm('本日のすべての履歴を消去してよろしいですか？')) return;
        history = []; resetCurrentRace(); saveData();
        updateDashboard(); renderHistory(); initOrUpdateChart(); renderCurrentRace();
        aiAvatar.className = 'ai-avatar'; aiAvatar.textContent = gameMode==='enjoy'?'🌸':gameMode==='win'?'🎯':'🤖';
        aiAdvice.textContent = '履歴をクリアしました。新しい戦績を入力して診断を始めましょう。';
        resultCard.style.display = 'none';
    });

    // --- Render current race ---
    function renderCurrentRace() {
        if (currentRace.status === 'setup') {
            raceSetupView.classList.remove('hidden');
            raceWaitingView.classList.add('hidden');
            raceNameInput.value = currentRace.raceName || '';
            horseCountInput.value = currentRace.horseCount || 16;

            ticketDraft = { betType: null, selections: [] };
            document.querySelectorAll('.bet-type-btn').forEach(b => b.classList.remove('active'));
            horseSelectionArea.classList.add('hidden');
            ticketAmountRow.style.display = 'none';
            btnAddTicket.style.display = 'none';
            addedTicketsList.innerHTML = '';

            if (currentRace.tickets.length === 0) {
                noTicketsMsg.style.display = 'block';
                preDiagnoseArea.classList.add('hidden');
                btnConfirmPurchase.disabled = true;
                return;
            }

            noTicketsMsg.style.display = 'none';
            preDiagnoseArea.classList.remove('hidden');
            btnConfirmPurchase.disabled = isFinished;

            let totalInvest = 0, sumRecip = 0;
            currentRace.tickets.forEach(ticket => {
                totalInvest += ticket.investment;
                sumRecip += 1 / ticket.odds;
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${ticket.betName}</td><td>¥${ticket.investment.toLocaleString()}</td><td>${ticket.odds.toFixed(1)}倍</td><td>¥${Math.round(ticket.investment*ticket.odds).toLocaleString()}</td><td style="text-align:center"></td>`;
                const delBtn = document.createElement('button');
                delBtn.className='btn-delete-row'; delBtn.innerHTML='&times;';
                delBtn.addEventListener('click', () => removeTicket(ticket.id));
                tr.cells[4].appendChild(delBtn);
                addedTicketsList.appendChild(tr);
            });

            const syntheticOdds = sumRecip > 0 ? 1 / sumRecip : 0;
            preTotalInvestmentEl.textContent = `¥${totalInvest.toLocaleString()}`;
            preSyntheticOddsEl.textContent   = `${syntheticOdds.toFixed(2)}倍`;

            let trigamiTickets = [], isFullTrigami = true;
            currentRace.tickets.forEach(t => {
                if (t.investment * t.odds < totalInvest) trigamiTickets.push(t);
                else isFullTrigami = false;
            });

            if (trigamiTickets.length > 0) {
                trigamiWarning.classList.remove('hidden');
                if (isFullTrigami) {
                    trigamiWarning.className = 'trigami-box danger-trigami';
                    trigamiWarningText.textContent = `警告：完全なトリガミ状態です！どの馬券が的中しても投資総額（¥${totalInvest.toLocaleString()}）を下回ります。`;
                } else {
                    trigamiWarning.className = 'trigami-box';
                    trigamiWarningText.textContent = `注意：一部の買い目でトリガミが発生します（${trigamiTickets.map(t=>`「${t.betName}」`).join(', ')}）。`;
                }
            } else {
                trigamiWarning.classList.add('hidden');
            }

            const budgetLossLimit = budget - getOverallLoss();
            if (totalInvest > budgetLossLimit) {
                updateAiAvatarState('state-danger', '👿');
                aiAdvice.textContent = {
                    enjoy:   `ちょっと待って！投資額 ¥${totalInvest.toLocaleString()} が残り許容損失（¥${budgetLossLimit.toLocaleString()}）を超えてるよ。馬券を減らしてね🌸`,
                    balance: `警告！このレースへの総投資額 ¥${totalInvest.toLocaleString()} は残り許容損失（¥${budgetLossLimit.toLocaleString()}）を超えています。`,
                    win:     `購入不可。投資額 ¥${totalInvest.toLocaleString()} が残り許容損失 ¥${budgetLossLimit.toLocaleString()} を超過。即座に見直してください。`
                }[gameMode || 'balance'];
                btnConfirmPurchase.disabled = true;
                return;
            }

            const mode = gameMode || 'balance';
            let preAdvice;
            if (isFullTrigami) {
                preAdvice = {
                    enjoy:   `${currentRace.tickets.length}点（合計 ¥${totalInvest.toLocaleString()}）登録中。でも今は完全トリガミ状態。どれが当たっても損しちゃうから、買い目を整理してから確定しようね🌸`,
                    balance: `${currentRace.tickets.length}点の馬券（合計 ¥${totalInvest.toLocaleString()}）が登録されています。完全トリガミ状態です。この状態での購入はお勧めしません！`,
                    win:     `${currentRace.tickets.length}点・¥${totalInvest.toLocaleString()}。完全トリガミ（合成オッズ${syntheticOdds.toFixed(2)}倍）。期待値は確定でマイナス。構成を根本的に見直してください。`
                }[mode];
            } else if (trigamiTickets.length > 0) {
                preAdvice = {
                    enjoy:   `${currentRace.tickets.length}点（合計 ¥${totalInvest.toLocaleString()}）いい感じ！一部トリガミがあるから気をつけてね🌸`,
                    balance: `${currentRace.tickets.length}点（合計 ¥${totalInvest.toLocaleString()}）。一部買い目でトリガミが発生しています。買い目の絞り込みを検討してください。`,
                    win:     `${currentRace.tickets.length}点・¥${totalInvest.toLocaleString()}。一部トリガミあり（合成オッズ${syntheticOdds.toFixed(2)}倍）。回収率向上には期待値プラスの買い目への絞り込みを推奨。`
                }[mode];
            } else {
                preAdvice = {
                    enjoy:   `${currentRace.tickets.length}点（合計 ¥${totalInvest.toLocaleString()}）、バランスよくできてるよ！楽しみながら確定へ進もう🌸`,
                    balance: `${currentRace.tickets.length}点（合計 ¥${totalInvest.toLocaleString()}）。買い目のバランスは良好（合成オッズ${syntheticOdds.toFixed(2)}倍）。冷静な判断で購入確定へ。`,
                    win:     `${currentRace.tickets.length}点・¥${totalInvest.toLocaleString()}（合成オッズ${syntheticOdds.toFixed(2)}倍）。トリガミなし。期待値の根拠を確認のうえ購入確定へ。`
                }[mode];
            }
            aiAdvice.textContent = preAdvice;
            updateAiMoodBasedOnOverall();

        } else if (currentRace.status === 'waiting') {
            raceSetupView.classList.add('hidden');
            raceWaitingView.classList.remove('hidden');
            waitingRaceName.textContent = currentRace.raceName || '一般レース';

            purchasedTicketsList.innerHTML = '';
            let totalInvest = 0;
            currentRace.tickets.forEach(ticket => {
                totalInvest += ticket.investment;
                const tr = document.createElement('tr');

                const chkTd = document.createElement('td'); chkTd.style.textAlign='center';
                const chk = document.createElement('input'); chk.type='checkbox'; chk.className='chk-box'; chk.checked=!!ticket.isWon;
                chk.addEventListener('change', e => { ticket.isWon=e.target.checked; saveData(); calculateWaitingReturn(); updatePayoutCell(payoutTd, ticket); });
                chkTd.appendChild(chk);

                const actualOddsInput = document.createElement('input');
                actualOddsInput.type='number'; actualOddsInput.className='actual-odds-input';
                actualOddsInput.min='1.0'; actualOddsInput.step='0.1'; actualOddsInput.placeholder='例: 5.2';
                if (ticket.actualOdds != null) actualOddsInput.value = ticket.actualOdds;
                actualOddsInput.addEventListener('input', e => {
                    const v = parseFloat(e.target.value);
                    ticket.actualOdds = (!isNaN(v) && v >= 1.0) ? v : null;
                    saveData(); calculateWaitingReturn(); updatePayoutCell(payoutTd, ticket);
                });
                const actualOddsTd = document.createElement('td'); actualOddsTd.appendChild(actualOddsInput);

                const payoutTd = document.createElement('td');
                updatePayoutCell(payoutTd, ticket);

                tr.appendChild(chkTd);
                ['', ticket.betName, `¥${ticket.investment.toLocaleString()}`, `${ticket.odds.toFixed(1)}倍`].forEach((txt, i) => {
                    if (i === 0) return;
                    const td = document.createElement('td'); td.textContent = txt; tr.appendChild(td);
                });
                tr.appendChild(actualOddsTd);
                tr.appendChild(payoutTd);

                const chkRow = tr.cloneNode(false);
                chkRow.appendChild(chkTd);
                const nameTd=document.createElement('td'); nameTd.textContent=ticket.betName;
                const invTd=document.createElement('td'); invTd.textContent=`¥${ticket.investment.toLocaleString()}`;
                const oddsTd=document.createElement('td'); oddsTd.textContent=`${ticket.odds.toFixed(1)}倍`;
                chkRow.appendChild(nameTd); chkRow.appendChild(invTd); chkRow.appendChild(oddsTd);
                chkRow.appendChild(actualOddsTd); chkRow.appendChild(payoutTd);
                purchasedTicketsList.appendChild(chkRow);
            });

            waitingTotalInvestment.textContent = `¥${totalInvest.toLocaleString()}`;
            calculateWaitingReturn();
        }
    }

    function removeTicket(id) {
        currentRace.tickets = currentRace.tickets.filter(t => t.id !== id);
        saveData(); renderCurrentRace();
    }
    function getEffectiveOdds(t) { return t.actualOdds != null ? t.actualOdds : t.odds; }
    function updatePayoutCell(td, ticket) {
        const eff = getEffectiveOdds(ticket);
        const p = ticket.isWon ? Math.round(ticket.investment * eff) : 0;
        td.innerHTML = ticket.actualOdds != null
            ? `¥${p.toLocaleString()} <span class="odds-confirmed">確定</span>`
            : `¥${p.toLocaleString()} <span class="odds-predicted">予想</span>`;
    }
    function calculateWaitingReturn() {
        let r = 0;
        currentRace.tickets.forEach(t => { if (t.isWon) r += Math.round(t.investment * getEffectiveOdds(t)); });
        waitingCalculatedReturn.textContent = `¥${r.toLocaleString()}`;
        waitingCalculatedReturn.className = r > 0 ? 'val win-text' : 'val';
    }

    // --- 馬券ビルダー ---
    const BET_CONFIG = {
        '単勝':  { maxSelect:1, ordered:false, useFrames:false, label:'馬番を1頭選んでください' },
        '複勝':  { maxSelect:1, ordered:false, useFrames:false, label:'馬番を1頭選んでください' },
        '枠連':  { maxSelect:2, ordered:false, useFrames:true,  label:'枠番を2つ選んでください（順不同）' },
        '馬連':  { maxSelect:2, ordered:false, useFrames:false, label:'馬番を2頭選んでください（順不同）' },
        '馬単':  { maxSelect:2, ordered:true,  useFrames:false, label:'1着・2着の順番でタップしてください' },
        'ワイド': { maxSelect:2, ordered:false, useFrames:false, label:'馬番を2頭選んでください（順不同）' },
        '3連複': { maxSelect:3, ordered:false, useFrames:false, label:'馬番を3頭選んでください（順不同）' },
        '3連単': { maxSelect:3, ordered:true,  useFrames:false, label:'1着→2着→3着の順番でタップしてください' },
    };

    let ticketDraft = { betType: null, selections: [] };

    document.querySelectorAll('.bet-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isFinished) return;
            ticketDraft = { betType: btn.dataset.type, selections: [] };
            document.querySelectorAll('.bet-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            horseSelectionArea.classList.remove('hidden');
            ticketAmountRow.style.display = 'none'; btnAddTicket.style.display = 'none';
            renderHorseGrid();
        });
    });

    horseCountInput.addEventListener('input', () => {
        currentRace.horseCount = parseInt(horseCountInput.value, 10) || 16;
        if (ticketDraft.betType) { ticketDraft.selections = []; renderHorseGrid(); }
    });

    function renderHorseGrid() {
        const cfg = BET_CONFIG[ticketDraft.betType]; if (!cfg) return;
        const count = cfg.useFrames ? 8 : Math.min(Math.max(parseInt(horseCountInput.value,10)||16, 2), 18);
        selectionInstruction.textContent = cfg.label;
        horseGrid.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const btn = document.createElement('button'); btn.type='button'; btn.className='horse-btn';
            const idx = ticketDraft.selections.indexOf(i);
            const numSpan = document.createElement('span'); numSpan.className='horse-num'; numSpan.textContent=i;
            btn.appendChild(numSpan);
            if (idx !== -1) {
                btn.classList.add('selected');
                if (cfg.ordered) { const b=document.createElement('span'); b.className='horse-order-badge'; b.textContent=['1着','2着','3着'][idx]; btn.appendChild(b); }
            }
            btn.addEventListener('click', () => {
                if (isFinished) return;
                const j = ticketDraft.selections.indexOf(i);
                if (j !== -1) ticketDraft.selections = cfg.ordered ? ticketDraft.selections.slice(0,j) : ticketDraft.selections.filter((_,k)=>k!==j);
                else if (ticketDraft.selections.length < cfg.maxSelect) ticketDraft.selections.push(i);
                renderHorseGrid();
            });
            horseGrid.appendChild(btn);
        }
        const rem = cfg.maxSelect - ticketDraft.selections.length;
        if (ticketDraft.selections.length === 0) { selectionPreview.textContent='選択中: なし'; selectionPreview.className='selection-preview'; }
        else {
            const name = genBetName(ticketDraft.betType, ticketDraft.selections, cfg);
            selectionPreview.textContent = rem > 0 ? `選択中: ${name}（あと${rem}${cfg.useFrames?'枠':'頭'}選択）` : `買い目決定: ${name}`;
            selectionPreview.className = rem > 0 ? 'selection-preview' : 'selection-preview complete';
        }
        const complete = ticketDraft.selections.length === cfg.maxSelect;
        ticketAmountRow.style.display = complete ? '' : 'none';
        btnAddTicket.style.display    = complete ? '' : 'none';
    }

    function genBetName(betType, selections, cfg) {
        if (!cfg) cfg = BET_CONFIG[betType];
        const arr = cfg.ordered ? [...selections] : [...selections].sort((a,b)=>a-b);
        return `${betType} ${arr.join(cfg.ordered?'→':'-')}`;
    }

    btnAddTicket.addEventListener('click', () => {
        const cfg = BET_CONFIG[ticketDraft.betType];
        if (!cfg || ticketDraft.selections.length !== cfg.maxSelect) { alert('馬券の買い目を選択してください'); return; }
        const invest = parseInt(ticketInvestmentInput.value, 10);
        const odds   = parseFloat(ticketOddsInput.value);
        if (isNaN(invest)||invest<=0) { alert('購入金額を正しく入力してください'); return; }
        if (isNaN(odds)||odds<1.0)   { alert('オッズを正しく入力してください（1.0以上）'); return; }
        currentRace.raceName  = raceNameInput.value.trim();
        currentRace.horseCount = parseInt(horseCountInput.value,10)||16;
        currentRace.tickets.push({ id:Date.now()+Math.random(), betName:genBetName(ticketDraft.betType,ticketDraft.selections,cfg), investment:invest, odds, isWon:false });
        ticketDraft = { betType:null, selections:[] };
        saveData(); renderCurrentRace();
        ticketInvestmentInput.value=''; ticketOddsInput.value='';
    });

    // --- 購入確定 ---
    btnConfirmPurchase.addEventListener('click', () => {
        if (currentRace.tickets.length === 0) return;
        aiAdvice.style.display='none'; aiLoader.style.display='flex'; resultCard.style.display='none';
        loaderStep.textContent='🔒 馬券の購入内容を確定中...';
        setTimeout(() => {
            aiLoader.style.display='none'; aiAdvice.style.display='block';
            currentRace.raceName  = raceNameInput.value.trim();
            currentRace.horseCount = parseInt(horseCountInput.value,10)||16;
            currentRace.status = 'waiting'; saveData(); renderCurrentRace();
            const total = currentRace.tickets.reduce((s,t)=>s+t.investment, 0);
            aiAvatar.className='ai-avatar'; aiAvatar.textContent='🧐';
            aiAdvice.textContent = {
                enjoy:   `購入確定！総投資額 ¥${total.toLocaleString()}。レースを楽しんでね🌸 結果が出たら的中馬券にチェックしてね！`,
                balance: `レースの購入が確定しました。総投資額は ¥${total.toLocaleString()} です。的中した馬券にチェックを入れてください。健闘を祈ります！`,
                win:     `購入確定。投資額 ¥${total.toLocaleString()}。結果を冷静に受け入れ、的中馬券をチェックしてください。`
            }[gameMode||'balance'];
            updateDashboard();
        }, 1000);
    });

    btnCancelRace.addEventListener('click', () => {
        if (!confirm('このレースの購入を取り消して再編集画面に戻りますか？')) return;
        currentRace.status='setup'; saveData(); renderCurrentRace(); updateDashboard();
    });

    // --- タイピング ---
    function typeText(el, text, speed=20, cb=null) {
        el.innerHTML=''; el.classList.add('typing-caret');
        let i=0; isTyping=true;
        function type() {
            if (i<text.length) { el.innerHTML += text.charAt(i)==='\n' ? '<br>' : text.charAt(i); i++; setTimeout(type,speed); }
            else { el.classList.remove('typing-caret'); isTyping=false; if(cb) cb(); }
        }
        type();
    }

    function updateAiAvatarState(moodClass, char) {
        aiAvatar.className = 'ai-avatar';
        if (moodClass) aiAvatar.classList.add(moodClass);
        aiAvatar.textContent = char;
    }

    function updateAiMoodBasedOnOverall() {
        if (history.length === 0) {
            updateAiAvatarState('', gameMode==='enjoy'?'🌸':gameMode==='win'?'🎯':'🤖'); return;
        }
        let inv=0,ret=0;
        history.forEach(i=>{ inv+=i.investment; ret+=i.returnAmt; });
        const bal=ret-inv, loss=inv-ret;
        const lr = budget>0 ? (loss/budget)*100 : 0;
        if (bal>0) { updateAiAvatarState('state-win', bal>=budget*0.5?'🤩':'😊'); }
        else if (bal<0) {
            if (lr>=100) updateAiAvatarState('state-danger','👿');
            else if (lr>=60) updateAiAvatarState('state-danger','🚨');
            else if (lr>=20) updateAiAvatarState('state-warn','⚠️');
            else updateAiAvatarState('state-warn','🧐');
        } else updateAiAvatarState('','😐');
    }

    // --- 診断ロジック（モード対応） ---
    function getDiagnosis(invest, ret) {
        let tInv=0, tRet=0;
        history.forEach(i=>{ tInv+=i.investment; tRet+=i.returnAmt; });
        tInv+=invest; tRet+=ret;
        const bal=tRet-tInv, loss=tInv-tRet;
        const lr = budget>0 ? (loss/budget)*100 : 0;
        const rr = tInv>0 ? Math.round((tRet/tInv)*100) : 0;
        const prof = (bal/budget)*100;
        const m = gameMode||'balance';

        let styleClass='', title='', advice='', avatarClass='', avatarChar='🤖';
        let metrics={control:50,efficiency:50,risk:50,mind:50};

        if (bal > 0) {
            if (prof >= 100) {
                styleClass='win-huge'; title='異次元の神予想！軍資金2倍突破';
                avatarClass='state-win'; avatarChar='🤩';
                metrics={control:75,efficiency:100,risk:40,mind:60};
                advice={
                    enjoy: `すごい！軍資金の2倍以上を稼いじゃった🤩！\n\n今日の競馬脳は完全に冴えてるね。でもここが落とし穴——「今日は負けない」と脳が錯覚して次のレースでどんどん賭けちゃいがち。今すぐ「今日の競馬を終了」して利益を確定させよう🌸 それが一番賢い選択！`,
                    balance: `素晴らしい！トータル収支が設定予算を超える大勝利です！回収率${rr}%。\n\nしかしここが最大の落とし穴です。「今日はいくら賭けても負けない」と錯覚し、次のレースで賭け金を急激に跳ね上げがちです。利益を確定させて今日は完全終了にするのが最もスマートな選択です！`,
                    win: `回収率${rr}%・予算比+${Math.round(prof)}%。最高水準の結果です。\n\nただし、この結果が再現可能な戦略によるものか運によるものかを冷静に判断してください。過信した状態での賭け金増額は最悪のパターンです。利益確定・即時終了が合理的な選択です。`
                }[m];
            } else if (prof >= 30) {
                styleClass='win-medium'; title='素晴らしい！見事な中勝ち';
                avatarClass='state-win'; avatarChar='😊';
                metrics={control:85,efficiency:90,risk:60,mind:75};
                advice={
                    enjoy: `やったね！予算の30%以上の利益が出てるよ😊！\n\n次のレースで欲張って金額を増やさないのが大事。今の賭け金のまま、同じ気持ちでいこう。勝っている時こそ冷静に。それが長く楽しむ秘訣だよ🌸`,
                    balance: `おめでとうございます！予算の30%以上に相当する利益を獲得できています。回収率${rr}%。\n\nこの流れを維持するためにも、次レースでは金額を増やさず当初のベース賭け金を厳守してください。`,
                    win: `回収率${rr}%・予算比+${Math.round(prof)}%。戦略が機能しています。\n\nここで賭け金を増額したくなるのが人間心理ですが、期待値計算を無視した行動です。同じ戦略・同じ賭け金の継続が長期回収率を安定させます。`
                }[m];
            } else {
                styleClass='win-small'; title='手堅く勝利！プラス域キープ';
                avatarClass='state-win'; avatarChar='👍';
                metrics={control:90,efficiency:80,risk:80,mind:85};
                advice={
                    enjoy: `プラスをキープ！えらい！競馬でプラスを維持するのって実はすごく難しいことなんだよ🌸\n\nわずかな利益でも、次の大勝負の資金にして溶かさないでね。今日のような低リスクスタイルを崩さずにいこう！`,
                    balance: `お見事！トータル収支はプラス域をキープ。回収率${rr}%。\n\nわずかな利益でも、それを次の大勝負の資金にして溶かしてしまっては意味がありません。低リスク・低投資のスタイルを崩さずにいきましょう。`,
                    win: `回収率${rr}%でプラス域。現段階では戦略として成立しています。\n\nただし利益幅が小さく、1レースの大負けで簡単に消える水準です。引き続き賭け金を抑制し、回収率の安定を優先してください。`
                }[m];
            }
        } else if (bal === 0) {
            styleClass='draw'; title='セーフ！完全なトントン';
            avatarChar='😐'; metrics={control:85,efficiency:50,risk:80,mind:80};
            advice={
                enjoy: `損も得もなし。でも楽しめたなら十分だよ！財布を守りながらスリルを楽しめた。熱くなって「次こそは！」と無理しないようにね🌸`,
                balance: `トータル収支は±0、引き分けです。軍資金を減らさずにスリルを楽しめたのは十分な結果です。ここで「次こそ勝つ！」と無理な賭けをするとマイナスへ転落します。`,
                win: `回収率${rr}%（プラマイゼロ）。損失なしで終えた点は最低限クリアですが、投資として利益ゼロ。次レースでは期待値プラスを確信できる買い目に絞り、回収率100%超を目指してください。`
            }[m];
        } else {
            if (lr <= 20) {
                styleClass='lose-small'; title='軽微なマイナス (損失 20%以下)';
                avatarClass='state-warn'; avatarChar='🧐';
                metrics={control:80,efficiency:45,risk:70,mind:70};
                advice={
                    enjoy: `少し負けちゃったけど大丈夫！損失は予算の${Math.round(lr)}%で余裕があるよ🌸\n\n「取り戻そう」って思い始めたら要注意。焦らず気持ちをリセットして、次のレースも楽しもう！`,
                    balance: `損失は予算の${Math.round(lr)}%未満。まだ十分リカバリー可能な小さな傷です。\n\n焦って賭け金を2倍にしたりしないように。この小さなマイナスを冷静に許容できるかが、使いすぎ防止の第一歩です。`,
                    win: `回収率${rr}%（損失${Math.round(lr)}%）。軽微な損失ですが、ここで賭け金を増やして"取り戻そう"とするのは最悪の意思決定です。期待値は変わりません。次のレースの根拠を再確認してください。`
                }[m];
            } else if (lr <= 40) {
                styleClass='lose-small'; title='警告レベル2 (損失 20%〜40%)';
                avatarClass='state-warn'; avatarChar='⚠️';
                metrics={control:65,efficiency:40,risk:55,mind:60};
                advice={
                    enjoy: `ちょっと負けが込んできたね。予算の${Math.round(lr)}%を使っちゃったよ。\n\n「少し負けてきたな」って感じたら正しい感覚。次のレースは本当に楽しみたいやつ？そうじゃないなら一旦休憩しようよ。深呼吸して🌸`,
                    balance: `損失が予算の${Math.round(lr)}%に達しました。次のレースは本当に自信のある本命レースですか？もしそうでないなら、見送って頭を休めることを強くお勧めします。`,
                    win: `回収率${rr}%（損失${Math.round(lr)}%）。損失が拡大傾向。現在の戦略に問題がある可能性があります。次レースの根拠を再確認し、確信がなければパスが合理的な判断です。`
                }[m];
            } else if (lr <= 60) {
                styleClass='lose-medium'; title='警告レベル3 (損失 40%〜60%)';
                avatarClass='state-danger'; avatarChar='🚨';
                metrics={control:45,efficiency:30,risk:35,mind:40};
                advice={
                    enjoy: `ちょっと待って！予算の${Math.round(lr)}%を使っちゃったよ。半分近く…。\n\n今「取り返そう」って気持ちになってたら危険サイン。楽しむはずが「ムキになる」に変わってたら、今日はここで止めるのが一番。一度休もうよ🌸`,
                    balance: `危険：予算の半分近く（${Math.round(lr)}%）を失いました！「熱くなりやすいゾーン」です。\n\n失った分を取り返そうと大穴馬券に高額を突っ込みたくなっていませんか？冷静さを欠いた予想はさらなる負けを引き寄せます。`,
                    win: `回収率${rr}%（損失${Math.round(lr)}%）。深刻な水域。"逆転狙い"は期待値をさらにマイナスにする可能性が高く非推奨。損失確定で撤退する判断も重要な戦略です。`
                }[m];
            } else if (lr <= 80) {
                styleClass='lose-medium'; title='警告レベル4 (損失 60%〜80%)';
                avatarClass='state-danger'; avatarChar='🚨';
                metrics={control:30,efficiency:20,risk:20,mind:25};
                advice={
                    enjoy: `危ない！予算の${Math.round(lr)}%を使ってしまったよ。崖っぷちだよ…。\n\n今すぐ「今日の競馬を終了する」を押して残りを守ろう。ムリをするより、また別の日に楽しむ方が絶対いいよ🌸`,
                    balance: `厳重注意：予算の${Math.round(lr)}%を失っています。崖っぷちです！\n\n一番自信のあるレースを1つだけ選ぶか、今すぐ終了して予算の残り20%を守り抜くのが最善です。`,
                    win: `回収率${rr}%（損失${Math.round(lr)}%）。継続する合理的根拠を明確に説明できますか？できないなら撤退が最善戦略。感情での継続は損失を最大化するだけです。`
                }[m];
            } else if (lr < 100) {
                styleClass='lose-huge'; title='警告レベル5 (損失 80%〜100%)';
                avatarClass='state-danger'; avatarChar='👿';
                metrics={control:15,efficiency:10,risk:10,mind:10};
                advice={
                    enjoy: `もう限界に近いよ！予算の${Math.round(lr)}%を失っちゃってる…。\n\n大逆転を狙って残りを突っ込みたくなってるかもしれないけど絶対ダメ。傷を広げるだけ。今すぐ止めて休もう。今日はここまで🌸`,
                    balance: `極めて深刻：予算がほぼ底をつきました（${Math.round(lr)}%の損失）。大逆転を狙っても傷口を広げるだけです。今すぐ「今日のレースを終了する」を押してください。`,
                    win: `回収率${rr}%（損失${Math.round(lr)}%）。撤退基準を完全に超えています。これ以上継続する合理的な根拠は存在しません。即時終了してください。`
                }[m];
            } else {
                styleClass='lose-huge'; title='【即刻終了】予算上限オーバー！';
                avatarClass='state-danger'; avatarChar='👿';
                metrics={control:0,efficiency:5,risk:0,mind:0};
                advice={
                    enjoy: `ストップ！設定した予算を使い切っちゃったよ（損失${Math.round(lr)}%）。今すぐ止めよう。\n\n「もう1レースで取り返す」は絶対ダメ。次回もっと楽しい競馬ができるように、今日の教訓を活かしてね🌸`,
                    balance: `【緊急命令：即刻競馬を停止してください】\n予算上限を完全にオーバーしました（損失${Math.round(lr)}%）。「もう1レースで取り返す」などと考えてはいけません。今すぐ投票アプリからログアウトし、財布を閉じましょう。`,
                    win: `予算上限オーバー（損失${Math.round(lr)}%）。リスク管理ルールの完全な逸脱。即座に停止。これ以上の継続は損失最大化以外をもたらしません。今日のデータを分析し、次回戦略を根本から見直してください。`
                }[m];
            }
        }
        return {styleClass, title, advice, avatarClass, avatarChar, metrics};
    }

    // --- レース結果確定 ---
    btnSubmitResult.addEventListener('click', () => {
        if (isTyping || isFinished) return;
        let inv=0, ret=0;
        currentRace.tickets.forEach(t => { inv+=t.investment; if(t.isWon) ret+=Math.round(t.investment*getEffectiveOdds(t)); });

        btnSubmitResult.disabled=true; btnCancelRace.disabled=true;
        aiAdvice.style.display='none'; aiLoader.style.display='flex'; resultCard.style.display='none';

        [['📊 的中データを判定中...',0],['💰 払戻金を自動計算中...',500],['🧠 冷静度マインドをスキャン中...',1000],['🤖 レース診断レポートを生成中...',1500]]
            .forEach(([text,delay]) => setTimeout(()=>{ loaderStep.textContent=text; }, delay));

        setTimeout(() => {
            aiLoader.style.display='none'; aiAdvice.style.display='block';
            const d = getDiagnosis(inv, ret);

            resultCard.style.display='block';
            resultCard.className=`card result-card ${d.styleClass}`;
            resultTitle.textContent=d.title;
            const diff=ret-inv; const sign=diff>0?'+':'';
            resultIncome.textContent=`¥${sign}${diff.toLocaleString()}`;
            resultIncome.className=`result-income ${diff>0?'plus':diff<0?'minus':''}`;

            updateRadarBar(radarControl,d.metrics.control);
            updateRadarBar(radarEfficiency,d.metrics.efficiency);
            updateRadarBar(radarRisk,d.metrics.risk);
            updateRadarBar(radarMind,d.metrics.mind);
            updateAiAvatarState(d.avatarClass, d.avatarChar);

            typeText(aiAdvice, d.advice, 20, () => {
                const now=new Date();
                const timeStr=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
                history.push({ id:Date.now(), time:timeStr, raceName:currentRace.raceName||`${history.length+1}回目レース`, investment:inv, returnAmt:ret, balance:diff, tickets:JSON.parse(JSON.stringify(currentRace.tickets)) });
                resetCurrentRace(); saveData(); updateDashboard(); renderHistory(); initOrUpdateChart(); renderCurrentRace();
                raceNameInput.value=''; ticketInvestmentInput.value=''; ticketOddsInput.value='';
                btnSubmitResult.disabled=false; btnCancelRace.disabled=false;
                if (budget>0 && (getOverallLoss()/budget)*100>=100) lockAppForFinish();
            });
        }, 2000);
    });

    function updateRadarBar(el, val) {
        el.style.width='0%'; el.className='radar-bar';
        setTimeout(()=>{ el.style.width=`${val}%`; el.classList.add(val>=75?'bar-success':val>=40?'bar-warning':'bar-danger'); }, 100);
    }

    // --- 今日終了 ---
    btnFinishDay.addEventListener('click', () => {
        const empty = history.length===0 && currentRace.tickets.length===0;
        if (!confirm(empty ? 'まだ1件も記録がありません。このまま本日の競馬を終了しますか？' : '今日の競馬を終了し、結果を確定しますか？終了すると追加の記録ができなくなります。')) return;
        isFinished=true; saveData(); lockAppForFinish();
    });

    function lockAppForFinish() {
        isFinished=true;
        [raceNameInput,horseCountInput,ticketInvestmentInput,ticketOddsInput].forEach(el=>el.disabled=true);
        [btnAddTicket,btnConfirmPurchase,btnFinishDay,btnSubmitResult,btnCancelRace,btnClearHistory].forEach(el=>el.disabled=true);
        document.querySelectorAll('.bet-type-btn').forEach(b=>b.disabled=true);
        renderHistory(); renderCurrentRace();

        let inv=0,ret=0;
        history.forEach(i=>{ inv+=i.investment; ret+=i.returnAmt; });
        const bal=ret-inv, lr=budget>0?(inv-ret)/budget*100:0;
        const rr=inv>0?Math.round(ret/inv*100):0;
        const m=gameMode||'balance';

        finishBalanceEl.textContent=`¥${bal>0?'+':''}${bal.toLocaleString()}`;
        finishBalanceEl.className=`val ${bal>0?'plus':bal<0?'minus':''}`;
        finishRecoveryRateEl.textContent=`${rr}%`;
        finishRecoveryRateEl.className=`val ${rr>=100?'plus':rr>=50?'warning':'minus'}`;
        finishRaceCountEl.textContent=`${history.length}回`;

        let fa='';
        if (bal > 0) {
            updateAiAvatarState('state-win','🤩');
            fa={
                enjoy: `やったー！今日はプラス収支で終われたよ🎉！回収率${rr}%！\n\n勝っている段階で終了ボタンを押せた自制心、すごいよ。その勝ち分はすぐ出金して美味しいもの食べてね🌸 また楽しい競馬しようね！`,
                balance: `素晴らしい！最終的にプラス収支で逃げ切りました！回収率${rr}%。勝っている段階でレース終了を選べたその自制心は、プロの馬券師並みです。今日の勝ち分は即座に出金してください。`,
                win: `最終回収率${rr}%・予算比+${Math.round((bal/budget)*100)}%。数値的に優秀な結果です。今日の有効だった戦略を記録しておくことを推奨します。再現性のある戦略構築が長期収益に繋がります。`
            }[m];
        } else if (bal === 0) {
            updateAiAvatarState('','😐');
            fa={
                enjoy: `損も得もなしのトントンで終わったよ！損失ゼロで楽しめたなら十分🌸 次回は少し利益が出るといいね。お疲れ様！`,
                balance: `本日はトントンでの決着。損失なく楽しめたのは良い結果です。次回は今回の買い方を振り返り、少しでもプラスを目指しましょう。`,
                win: `最終回収率${rr}%。損失なしだが利益もゼロ。次回は期待値プラスの買い目を厳選し回収率100%超を目指してください。`
            }[m];
        } else {
            if (lr >= 100) {
                updateAiAvatarState('state-danger','👿');
                fa={
                    enjoy: `今日は予算を全部使い切る結果になっちゃったね（損失${Math.round(lr)}%）。悔しいよね…。でも他からお金を持ってきて取り返すのは絶対ダメ。まず財布を閉じて、冷静になる時間を作ろう🌸`,
                    balance: `警告：予算枠をすべて使い果たす結果となりました（損失${Math.round(lr)}%）。絶対に「他からお金を持ってきて取り返す」勝負はしないでください。`,
                    win: `最終回収率${rr}%（損失${Math.round(lr)}%）。リスク管理上限超え。今日の意思決定を冷静に分析し、次回は戦略を根本から見直してください。`
                }[m];
            } else if (lr >= 50) {
                updateAiAvatarState('state-danger','🚨');
                fa={
                    enjoy: `今日は半分以上（損失${Math.round(lr)}%）負けちゃったね…。でも全部溶かす前に終われたのは偉い！残った分は次の大切なお金だよ。今日を振り返ってみてね🌸`,
                    balance: `予算の半分以上（損失${Math.round(lr)}%）を失いましたが、全損前に撤退できたのは大きな一歩です。残った資金を大切に、次回の戦いに備えましょう。`,
                    win: `最終回収率${rr}%（損失${Math.round(lr)}%）。撤退の判断は適切でした。何レースで期待値マイナスの賭けをしたか分析し、次回の改善に活かしてください。`
                }[m];
            } else {
                updateAiAvatarState('state-warn','🧐');
                fa={
                    enjoy: `今日は少しだけ負けちゃったけど（損失${Math.round(lr)}%）、軽い損失で抑えられた！自制心の証だよ。次回もっと楽しく過ごせるはず🌸 お疲れ様でした！`,
                    balance: `本日は微減（損失${Math.round(lr)}%）。損失を軽微に抑えて終了できたのは優れた自己コントロール力の証です。次回の反省点を整理しておきましょう。`,
                    win: `最終回収率${rr}%（損失${Math.round(lr)}%）。軽微な損失で抑えた点は評価できます。的中率の低かった馬券種の見直しや資金配分の最適化を検討してください。`
                }[m];
            }
        }

        finishSummaryCard.classList.remove('hidden');
        inputCard.classList.add('hidden');
        typeText(finishAiAdviceEl, fa, 15);
    }

    // --- リセット ---
    btnResetDay.addEventListener('click', () => {
        if (!confirm('今日のデータをクリアし、モード選択から新しく始めますか？')) return;
        ['keiba_v5_budget','keiba_v5_history','keiba_v5_finished','keiba_v5_current_race','keiba_v5_mode'].forEach(k=>localStorage.removeItem(k));
        budget=0; history=[]; isFinished=false; gameMode=null; resetCurrentRace();
        [raceNameInput,horseCountInput,ticketInvestmentInput,ticketOddsInput].forEach(el=>el.disabled=false);
        [btnAddTicket,btnConfirmPurchase,btnFinishDay,btnSubmitResult,btnCancelRace].forEach(el=>el.disabled=false);
        document.querySelectorAll('.bet-type-btn').forEach(b=>b.disabled=false);
        finishSummaryCard.classList.add('hidden'); inputCard.classList.remove('hidden');
        if (keibaChart) { keibaChart.destroy(); keibaChart=null; }
        document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('selected'));
        btnConfirmMode.disabled=true;
        loadData();
    });

    // --- Chart ---
    function initOrUpdateChart() {
        const ctx=document.getElementById('keiba-chart').getContext('2d');
        const labels=['開始']; const chartData=[0]; let cum=0;
        history.forEach((item,i)=>{ cum+=(item.returnAmt-item.investment); labels.push(item.raceName||`${i+1}戦目`); chartData.push(cum); });
        const limitLine=Array(chartData.length).fill(-budget);

        if (keibaChart) {
            keibaChart.data.labels=labels;
            keibaChart.data.datasets[0].data=chartData;
            keibaChart.data.datasets[1].data=limitLine;
            keibaChart.options.scales.y.min=Math.min(-budget*1.2,...chartData)-1000;
            keibaChart.options.scales.y.max=Math.max(budget*0.5,...chartData)+1000;
            keibaChart.update();
        } else {
            keibaChart=new Chart(ctx,{
                type:'line',
                data:{ labels, datasets:[
                    { label:'トータル収支', data:chartData, borderColor:'#8b5cf6', borderWidth:3, backgroundColor:'rgba(139,92,246,0.15)', fill:true, tension:0.3, pointBackgroundColor:'#a78bfa', pointBorderColor:'#fff', pointRadius:5, pointHoverRadius:7 },
                    { label:'予算上限ライン', data:limitLine, borderColor:'#ef4444', borderWidth:2, borderDash:[5,5], fill:false, pointRadius:0 }
                ]},
                options:{
                    responsive:true, maintainAspectRatio:false,
                    plugins:{ legend:{ labels:{ color:'#e5e7eb', font:{family:"'Inter','Noto Sans JP',sans-serif",size:11} }}, tooltip:{ callbacks:{ label(ctx){ let l=ctx.dataset.label||''; if(l) l+=': '; if(ctx.parsed.y!==null) l+='¥'+ctx.parsed.y.toLocaleString(); return l; }}}},
                    scales:{
                        x:{ grid:{color:'rgba(255,255,255,0.05)'}, ticks:{color:'#9ca3af',font:{family:"'Inter','Noto Sans JP',sans-serif"}} },
                        y:{ grid:{color:'rgba(255,255,255,0.05)'}, ticks:{color:'#9ca3af',font:{family:"'Inter','Noto Sans JP',sans-serif"},callback(v){return'¥'+v.toLocaleString();}},
                            min:Math.min(-budget*1.2,...chartData)-1000, max:Math.max(budget*0.5,...chartData)+1000 }
                    }
                }
            });
        }
    }

    loadData();
});
