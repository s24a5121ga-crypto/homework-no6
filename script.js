// 競馬使いすぎ防止サポーター AI (V6)

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM要素の取得 ---
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

    // V6: 過去記録DOM
    const pastRecordsSection = document.getElementById('past-records-section');
    const pastDaysList = document.getElementById('past-days-list');
    const noPastRecords = document.getElementById('no-past-records');
    const btnClearAllPast = document.getElementById('btn-clear-all-past');

    // --- 状態変数 ---
    let budget = 0;
    let history = [];
    let isFinished = false;
    let isTyping = false;
    let keibaChart = null;
    let pastDays = [];

    let currentRace = {
        raceName: "",
        horseCount: 16,
        tickets: [],
        status: "setup"
    };

    // --- V6: 日付ユーティリティ ---
    function getTodayKey() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}${m}${day}`;
    }

    function getTodayStr() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const w = weekdays[d.getDay()];
        return `${y}/${m}/${day}(${w})`;
    }

    // --- V6: 過去日データ管理 ---
    function loadPastDays() {
        const stored = localStorage.getItem('keiba_v6_past_days');
        if (stored) {
            try { pastDays = JSON.parse(stored); } catch (e) { pastDays = []; }
        } else {
            pastDays = [];
        }
    }

    function savePastDays() {
        localStorage.setItem('keiba_v6_past_days', JSON.stringify(pastDays));
    }

    function archiveCurrentDay() {
        if (history.length === 0) return;

        let totalInvest = 0;
        let totalRet = 0;
        history.forEach(item => {
            totalInvest += item.investment;
            totalRet += item.returnAmt;
        });

        const balance = totalRet - totalInvest;
        const recoveryRate = totalInvest > 0 ? Math.round((totalRet / totalInvest) * 100) : 0;
        const dateKey = localStorage.getItem('keiba_v6_today_key') || getTodayKey();
        const dateStr = localStorage.getItem('keiba_v6_today_str') || getTodayStr();

        const dayRecord = {
            dateKey,
            dateStr,
            budget,
            history: JSON.parse(JSON.stringify(history)),
            totalInvestment: totalInvest,
            totalReturn: totalRet,
            balance,
            recoveryRate,
            raceCount: history.length
        };

        const existingIdx = pastDays.findIndex(d => d.dateKey === dateKey);
        if (existingIdx !== -1) {
            pastDays[existingIdx] = dayRecord;
        } else {
            pastDays.unshift(dayRecord);
        }
        savePastDays();
    }

    // --- V6: 過去記録のレンダリング ---
    function renderPastDays() {
        loadPastDays();

        if (pastDays.length === 0) {
            pastRecordsSection.classList.add('hidden');
            return;
        }

        pastRecordsSection.classList.remove('hidden');
        noPastRecords.style.display = 'none';

        // 累計サマリーの計算
        let cumBalance = 0;
        let totalInvest = 0;
        let totalRet = 0;
        let totalRaces = 0;
        let profitDays = 0;

        pastDays.forEach(d => {
            cumBalance += d.balance;
            totalInvest += d.totalInvestment;
            totalRet += d.totalReturn;
            totalRaces += d.raceCount;
            if (d.balance > 0) profitDays++;
        });

        const avgRecovery = totalInvest > 0 ? Math.round((totalRet / totalInvest) * 100) : 0;

        // 連続記録（ストリーク）計算
        let streak = 0;
        let streakType = '';
        for (let i = 0; i < pastDays.length; i++) {
            const dayType = pastDays[i].balance >= 0 ? 'win' : 'lose';
            if (i === 0) {
                streakType = dayType;
                streak = 1;
            } else if (dayType === streakType) {
                streak++;
            } else {
                break;
            }
        }

        // サマリーDOM更新
        document.getElementById('past-total-days').textContent = `${pastDays.length}日`;

        const balEl = document.getElementById('past-cumulative-balance');
        const sign = cumBalance > 0 ? '+' : '';
        balEl.textContent = `¥${sign}${cumBalance.toLocaleString()}`;
        balEl.className = `value ${cumBalance > 0 ? 'plus' : cumBalance < 0 ? 'minus' : ''}`;

        document.getElementById('past-avg-recovery').textContent = `${avgRecovery}%`;
        document.getElementById('past-total-races').textContent = `${totalRaces}回`;

        // ストリーク表示
        const streakArea = document.getElementById('past-streak-area');
        const streakBadge = document.getElementById('past-streak-badge');
        if (streak >= 2) {
            streakArea.style.display = '';
            if (streakType === 'win') {
                streakBadge.textContent = `🔥 ${streak}日連続プラス！`;
                streakBadge.className = 'past-streak-badge streak-win';
            } else {
                streakBadge.textContent = `📉 ${streak}日連続マイナス`;
                streakBadge.className = 'past-streak-badge streak-lose';
            }
        } else {
            streakArea.style.display = 'none';
        }

        // 過去日カードのレンダリング
        pastDaysList.innerHTML = '';
        pastDays.forEach((day, index) => {
            pastDaysList.appendChild(createDayCard(day, index));
        });
    }

    function createDayCard(day, index) {
        const isProfit = day.balance > 0;
        const isEven = day.balance === 0;
        const sign = day.balance > 0 ? '+' : '';
        const detailId = `past-detail-${index}`;

        const cardDiv = document.createElement('div');
        cardDiv.className = `past-day-card ${isProfit ? 'day-profit' : isEven ? 'day-even' : 'day-loss'}`;

        // ヘッダー部分
        const headerDiv = document.createElement('div');
        headerDiv.className = 'past-day-header';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'past-day-info';
        infoDiv.innerHTML = `
            <span class="past-day-date">${day.dateStr}</span>
            <span class="past-day-budget">予算 ¥${day.budget.toLocaleString()}</span>
        `;

        const statsDiv = document.createElement('div');
        statsDiv.className = 'past-day-stats';
        statsDiv.innerHTML = `
            <span class="past-day-stat-item">${day.raceCount}レース</span>
            <span class="past-day-stat-item">回収率 ${day.recoveryRate}%</span>
            <span class="past-day-balance ${isProfit ? 'plus' : isEven ? '' : 'minus'}">¥${sign}${day.balance.toLocaleString()}</span>
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'past-day-actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn-past-toggle';
        toggleBtn.textContent = '詳細 ▼';
        toggleBtn.dataset.target = detailId;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-past';
        deleteBtn.innerHTML = '✕';
        deleteBtn.title = 'この日の記録を削除';

        actionsDiv.appendChild(toggleBtn);
        actionsDiv.appendChild(deleteBtn);

        headerDiv.appendChild(infoDiv);
        headerDiv.appendChild(statsDiv);
        headerDiv.appendChild(actionsDiv);

        // 詳細部分（アコーディオン）
        const detailDiv = document.createElement('div');
        detailDiv.id = detailId;
        detailDiv.className = 'past-day-detail hidden';

        if (day.history && day.history.length > 0) {
            const table = document.createElement('table');
            table.className = 'past-history-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>時間</th>
                        <th>レース名</th>
                        <th>投資</th>
                        <th>回収</th>
                        <th>収支</th>
                    </tr>
                </thead>
            `;
            const tbody = document.createElement('tbody');
            day.history.forEach(race => {
                const diff = race.returnAmt - race.investment;
                const rSign = diff > 0 ? '+' : '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${race.time}</td>
                    <td>${race.raceName || '一般レース'}</td>
                    <td>¥${race.investment.toLocaleString()}</td>
                    <td>¥${race.returnAmt.toLocaleString()}</td>
                    <td class="${diff > 0 ? 'plus' : diff < 0 ? 'minus' : ''}">¥${rSign}${diff.toLocaleString()}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            detailDiv.appendChild(table);
        } else {
            detailDiv.innerHTML = '<p class="no-past-detail">詳細な馬券データはありません。</p>';
        }

        cardDiv.appendChild(headerDiv);
        cardDiv.appendChild(detailDiv);

        // アコーディオントグル
        toggleBtn.addEventListener('click', () => {
            const detail = document.getElementById(detailId);
            const isHidden = detail.classList.contains('hidden');

            document.querySelectorAll('.past-day-detail').forEach(d => d.classList.add('hidden'));
            document.querySelectorAll('.btn-past-toggle').forEach(b => {
                b.textContent = b.textContent.replace('▲', '▼');
            });

            if (isHidden) {
                detail.classList.remove('hidden');
                toggleBtn.textContent = '詳細 ▲';
            }
        });

        // 削除ボタン
        deleteBtn.addEventListener('click', () => {
            if (confirm(`${day.dateStr} の記録を削除しますか？`)) {
                pastDays.splice(index, 1);
                savePastDays();
                renderPastDays();
            }
        });

        return cardDiv;
    }

    // 全過去データクリア
    btnClearAllPast.addEventListener('click', () => {
        if (pastDays.length === 0) return;
        if (confirm('すべての過去記録を削除しますか？この操作は取り消せません。')) {
            pastDays = [];
            savePastDays();
            renderPastDays();
        }
    });

    // --- ローカルストレージ管理 ---
    function resetCurrentRace() {
        currentRace = {
            raceName: "",
            horseCount: 16,
            tickets: [],
            status: "setup"
        };
    }

    function loadData() {
        loadPastDays();

        // 日付変更チェック（新しい日になったら自動アーカイブ）
        const storedKey = localStorage.getItem('keiba_v6_today_key');
        const todayKey = getTodayKey();

        if (storedKey && storedKey !== todayKey) {
            const prevBudget = parseInt(localStorage.getItem('keiba_v6_budget') || '0', 10);
            const prevHistoryRaw = localStorage.getItem('keiba_v6_history');
            let prevHistory = [];
            if (prevHistoryRaw) {
                try { prevHistory = JSON.parse(prevHistoryRaw); } catch (e) {}
            }

            if (prevBudget > 0 && prevHistory.length > 0) {
                const prevKey = storedKey;
                const prevStr = localStorage.getItem('keiba_v6_today_str') || storedKey;
                let pInvest = 0, pRet = 0;
                prevHistory.forEach(r => { pInvest += r.investment; pRet += r.returnAmt; });
                const pBal = pRet - pInvest;
                const pRec = pInvest > 0 ? Math.round((pRet / pInvest) * 100) : 0;

                const rec = {
                    dateKey: prevKey,
                    dateStr: prevStr,
                    budget: prevBudget,
                    history: prevHistory,
                    totalInvestment: pInvest,
                    totalReturn: pRet,
                    balance: pBal,
                    recoveryRate: pRec,
                    raceCount: prevHistory.length
                };
                const eIdx = pastDays.findIndex(d => d.dateKey === prevKey);
                if (eIdx !== -1) { pastDays[eIdx] = rec; } else { pastDays.unshift(rec); }
                savePastDays();
            }

            // 今日のデータをクリア
            localStorage.removeItem('keiba_v6_budget');
            localStorage.removeItem('keiba_v6_history');
            localStorage.removeItem('keiba_v6_finished');
            localStorage.removeItem('keiba_v6_current_race');
            localStorage.removeItem('keiba_v6_today_str');
        }

        localStorage.setItem('keiba_v6_today_key', todayKey);
        localStorage.setItem('keiba_v6_today_str', getTodayStr());

        // V3/V4互換マイグレーション
        const storedBudget = localStorage.getItem('keiba_v6_budget')
            || localStorage.getItem('keiba_v3_budget')
            || localStorage.getItem('keiba_v2_budget');
        const storedHistory = localStorage.getItem('keiba_v6_history')
            || localStorage.getItem('keiba_v3_history');
        const storedFinished = localStorage.getItem('keiba_v6_finished')
            || localStorage.getItem('keiba_v3_finished');
        const storedCurrentRace = localStorage.getItem('keiba_v6_current_race')
            || localStorage.getItem('keiba_v3_current_race');

        if (storedBudget) {
            budget = parseInt(storedBudget, 10);
            displayBudgetEl.textContent = `¥${budget.toLocaleString()}`;

            budgetSetupSection.classList.add('hidden');
            mainAppContent.classList.remove('hidden');

            if (storedHistory) {
                try { history = JSON.parse(storedHistory); } catch (e) { history = []; }
            }

            if (storedFinished === 'true') isFinished = true;

            if (storedCurrentRace) {
                try { currentRace = JSON.parse(storedCurrentRace); } catch (e) { resetCurrentRace(); }
            } else {
                resetCurrentRace();
            }

            updateDashboard();
            renderHistory();
            initOrUpdateChart();
            renderCurrentRace();

            if (isFinished) {
                lockAppForFinish();
            } else {
                updateAiMoodBasedOnOverall();
            }
        } else {
            budgetSetupSection.classList.remove('hidden');
            mainAppContent.classList.add('hidden');
        }

        renderPastDays();
    }

    function saveData() {
        localStorage.setItem('keiba_v6_budget', budget.toString());
        localStorage.setItem('keiba_v6_history', JSON.stringify(history));
        localStorage.setItem('keiba_v6_finished', isFinished ? 'true' : 'false');
        localStorage.setItem('keiba_v6_current_race', JSON.stringify(currentRace));
    }

    // --- 予算設定 ---
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = parseInt(budgetInput.value, 10);
        if (isNaN(value) || value <= 0) return;

        budget = value;
        displayBudgetEl.textContent = `¥${budget.toLocaleString()}`;
        isFinished = false;
        history = [];
        resetCurrentRace();

        saveData();

        budgetSetupSection.classList.add('hidden');
        mainAppContent.classList.remove('hidden');

        aiAvatar.className = 'ai-avatar';
        aiAvatar.textContent = '🤖';
        aiAdvice.textContent = `本日の予算 ¥${budget.toLocaleString()} でサポーターAIを起動しました。馬券を登録して診断を開始しましょう！`;

        updateDashboard();
        renderHistory();
        initOrUpdateChart();
        renderCurrentRace();
    });

    // --- ダッシュボード更新 ---
    function updateDashboard() {
        let totalInvestment = 0;
        let totalReturn = 0;

        history.forEach(item => {
            totalInvestment += item.investment;
            totalReturn += item.returnAmt;
        });

        if (currentRace && currentRace.status === "waiting") {
            const waitingInvest = currentRace.tickets.reduce((sum, t) => sum + t.investment, 0);
            totalInvestment += waitingInvest;
        }

        const totalBalance = totalReturn - totalInvestment;

        totalInvestmentEl.textContent = `¥${totalInvestment.toLocaleString()}`;
        totalReturnEl.textContent = `¥${totalReturn.toLocaleString()}`;

        const sign = totalBalance > 0 ? '+' : '';
        totalBalanceEl.textContent = `¥${sign}${totalBalance.toLocaleString()}`;

        cardTotalBalance.className = 'summary-card';
        if (totalBalance > 0) cardTotalBalance.classList.add('status-win');
        else if (totalBalance < 0) cardTotalBalance.classList.add('status-lose');

        const loss = totalInvestment - totalReturn;
        let lossRatio = budget > 0 ? Math.max(0, (loss / budget) * 100) : 0;

        const displayRatio = Math.min(100, lossRatio);
        progressBar.style.width = `${displayRatio}%`;
        progressPercentage.textContent = `${Math.round(lossRatio)}%`;

        progressBar.className = 'progress-bar-fill';
        progressBar.style.boxShadow = '';

        if (lossRatio <= 0) {
            progressStatus.textContent = '安全：利益が出ているか、トントンです 📈';
            progressStatus.style.color = 'var(--win-color)';
            progressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
        } else if (lossRatio <= 20) {
            progressStatus.textContent = '注意レベル1：微損です。まだ十分立て直せます。';
            progressStatus.style.color = '#a7f3d0';
            progressBar.style.background = '#059669';
        } else if (lossRatio <= 40) {
            progressStatus.textContent = '注意レベル2：予算の40%を突破。賭け金を見直しましょう。';
            progressStatus.style.color = 'var(--warn-color)';
            progressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #fbbf24 100%)';
        } else if (lossRatio <= 60) {
            progressStatus.textContent = '注意レベル3：予算の半分を失いました！危険水域です。';
            progressStatus.style.color = '#f59e0b';
            progressBar.style.background = '#f59e0b';
        } else if (lossRatio <= 80) {
            progressStatus.textContent = '警告レベル4：予算の80%に到達。次の敗北は致命的です！';
            progressStatus.style.color = '#f87171';
            progressBar.style.background = 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)';
        } else if (lossRatio < 100) {
            progressStatus.textContent = '警告レベル5：軍資金がほぼ底をつきかけています！';
            progressStatus.style.color = 'var(--danger-color)';
            progressBar.style.background = '#dc2626';
        } else {
            progressStatus.textContent = '緊急事態：設定予算を完全にオーバーしました！即終了してください 🚨';
            progressStatus.style.color = 'var(--danger-color)';
            progressBar.style.background = '#ef4444';
            progressBar.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.8)';
        }
    }

    function getOverallLoss() {
        let totalInvestment = 0;
        let totalReturn = 0;
        history.forEach(item => {
            totalInvestment += item.investment;
            totalReturn += item.returnAmt;
        });
        return Math.max(0, totalInvestment - totalReturn);
    }

    // --- 履歴レンダリング ---
    function renderHistory() {
        historyList.innerHTML = '';

        if (history.length === 0) {
            noHistoryMsg.style.display = 'block';
            btnClearHistory.disabled = true;
            return;
        }
        noHistoryMsg.style.display = 'none';
        btnClearHistory.disabled = isFinished;

        [...history].reverse().forEach(item => {
            const detailId = `detail-${item.id}`;

            const trParent = document.createElement('tr');
            trParent.className = 'history-parent-row';
            trParent.dataset.target = detailId;

            const timeTd = document.createElement('td');
            timeTd.textContent = item.time;

            const nameTd = document.createElement('td');
            nameTd.innerHTML = `${item.raceName || '一般レース'} <span class="accordion-icon">▼</span>`;

            const investTd = document.createElement('td');
            investTd.textContent = `¥${item.investment.toLocaleString()}`;

            const returnTd = document.createElement('td');
            returnTd.textContent = `¥${item.returnAmt.toLocaleString()}`;

            const balanceTd = document.createElement('td');
            const diff = item.returnAmt - item.investment;
            const sign = diff > 0 ? '+' : '';
            balanceTd.textContent = `¥${sign}${diff.toLocaleString()}`;
            balanceTd.className = `col-income ${diff > 0 ? 'plus' : diff < 0 ? 'minus' : ''}`;

            const actionTd = document.createElement('td');
            actionTd.style.textAlign = 'center';
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete-row';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = '削除';
            deleteBtn.disabled = isFinished;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHistoryItem(item.id);
            });
            actionTd.appendChild(deleteBtn);

            trParent.appendChild(timeTd);
            trParent.appendChild(nameTd);
            trParent.appendChild(investTd);
            trParent.appendChild(returnTd);
            trParent.appendChild(balanceTd);
            trParent.appendChild(actionTd);

            trParent.addEventListener('click', () => {
                const detailRow = document.getElementById(detailId);
                if (detailRow) {
                    const isHidden = detailRow.classList.contains('hidden');
                    document.querySelectorAll('.history-detail-row').forEach(row => {
                        if (row.id !== detailId) row.classList.add('hidden');
                    });
                    document.querySelectorAll('.history-parent-row').forEach(p => {
                        if (p !== trParent) p.classList.remove('active');
                    });
                    if (isHidden) {
                        detailRow.classList.remove('hidden');
                        trParent.classList.add('active');
                    } else {
                        detailRow.classList.add('hidden');
                        trParent.classList.remove('active');
                    }
                }
            });

            const trDetail = document.createElement('tr');
            trDetail.id = detailId;
            trDetail.className = 'history-detail-row hidden';

            const detailTd = document.createElement('td');
            detailTd.colSpan = 6;

            const ticketsBox = document.createElement('div');
            ticketsBox.className = 'detail-tickets-box';

            if (item.tickets && item.tickets.length > 0) {
                item.tickets.forEach(ticket => {
                    const ticketItem = document.createElement('div');
                    ticketItem.className = 'detail-ticket-item';

                    const statusSpan = document.createElement('span');
                    statusSpan.className = `ticket-status ${ticket.isWon ? 'won' : 'lost'}`;
                    statusSpan.textContent = ticket.isWon ? '的中' : '不的中';

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'ticket-name';
                    nameSpan.textContent = ticket.betName;

                    const oddsSpan = document.createElement('span');
                    oddsSpan.className = 'ticket-odds';
                    oddsSpan.textContent = `オッズ: ${ticket.odds.toFixed(1)}倍`;

                    const amtSpan = document.createElement('span');
                    amtSpan.className = 'ticket-amt';
                    amtSpan.textContent = `購入: ¥${ticket.investment.toLocaleString()}`;

                    const retSpan = document.createElement('span');
                    const retVal = ticket.isWon ? Math.round(ticket.investment * ticket.odds) : 0;
                    retSpan.className = `ticket-ret ${retVal > 0 ? 'won-amt' : ''}`;
                    retSpan.textContent = `払戻: ¥${retVal.toLocaleString()}`;

                    ticketItem.appendChild(statusSpan);
                    ticketItem.appendChild(nameSpan);
                    ticketItem.appendChild(oddsSpan);
                    ticketItem.appendChild(amtSpan);
                    ticketItem.appendChild(retSpan);

                    ticketsBox.appendChild(ticketItem);
                });
            } else {
                const noDetails = document.createElement('div');
                noDetails.style.cssText = 'color: var(--text-muted); font-size: 0.8rem;';
                noDetails.textContent = '詳細な馬券データはありません。';
                ticketsBox.appendChild(noDetails);
            }

            detailTd.appendChild(ticketsBox);
            trDetail.appendChild(detailTd);

            historyList.appendChild(trParent);
            historyList.appendChild(trDetail);
        });
    }

    function deleteHistoryItem(id) {
        if (isFinished) return;
        history = history.filter(item => item.id !== id);
        saveData();
        updateDashboard();
        renderHistory();
        initOrUpdateChart();
        updateAiMoodBasedOnOverall();
    }

    btnClearHistory.addEventListener('click', () => {
        if (history.length === 0 || isFinished) return;
        if (confirm('本日のすべての履歴を消去してよろしいですか？')) {
            history = [];
            resetCurrentRace();
            saveData();
            updateDashboard();
            renderHistory();
            initOrUpdateChart();
            renderCurrentRace();

            aiAvatar.className = 'ai-avatar';
            aiAvatar.textContent = '🤖';
            aiAdvice.textContent = '履歴をクリアしました。新しい戦績を入力して診断を始めましょう。';
            resultCard.style.display = 'none';
        }
    });

    // --- 進行中レースの描画と事前診断 ---
    function renderCurrentRace() {
        if (currentRace.status === "setup") {
            raceSetupView.classList.remove('hidden');
            raceWaitingView.classList.add('hidden');

            raceNameInput.value = currentRace.raceName || '';
            horseCountInput.value = currentRace.horseCount || 16;

            ticketDraft = { betType: null, selections: [] };
            document.querySelectorAll('.bet-type-btn').forEach(btn => btn.classList.remove('active'));
            horseSelectionArea.classList.add('hidden');
            ticketAmountRow.style.display = 'none';
            btnAddTicket.style.display = 'none';

            addedTicketsList.innerHTML = '';
            if (currentRace.tickets.length === 0) {
                noTicketsMsg.style.display = 'block';
                preDiagnoseArea.classList.add('hidden');
                btnConfirmPurchase.disabled = true;
            } else {
                noTicketsMsg.style.display = 'none';
                preDiagnoseArea.classList.remove('hidden');
                btnConfirmPurchase.disabled = isFinished;

                let totalInvest = 0;
                let sumReciprocalOdds = 0;

                currentRace.tickets.forEach(ticket => {
                    totalInvest += ticket.investment;
                    sumReciprocalOdds += (1 / ticket.odds);

                    const tr = document.createElement('tr');

                    const nameTd = document.createElement('td');
                    nameTd.textContent = ticket.betName;

                    const investTd = document.createElement('td');
                    investTd.textContent = `¥${ticket.investment.toLocaleString()}`;

                    const oddsTd = document.createElement('td');
                    oddsTd.textContent = `${ticket.odds.toFixed(1)}倍`;

                    const predictedTd = document.createElement('td');
                    predictedTd.textContent = `¥${Math.round(ticket.investment * ticket.odds).toLocaleString()}`;

                    const actionTd = document.createElement('td');
                    actionTd.style.textAlign = 'center';
                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-delete-row';
                    delBtn.innerHTML = '&times;';
                    delBtn.addEventListener('click', () => removeTicket(ticket.id));
                    actionTd.appendChild(delBtn);

                    tr.appendChild(nameTd);
                    tr.appendChild(investTd);
                    tr.appendChild(oddsTd);
                    tr.appendChild(predictedTd);
                    tr.appendChild(actionTd);

                    addedTicketsList.appendChild(tr);
                });

                const syntheticOdds = sumReciprocalOdds > 0 ? (1 / sumReciprocalOdds) : 0;

                preTotalInvestmentEl.textContent = `¥${totalInvest.toLocaleString()}`;
                preSyntheticOddsEl.textContent = `${syntheticOdds.toFixed(2)}倍`;

                let trigamiTickets = [];
                let isFullTrigami = true;

                currentRace.tickets.forEach(ticket => {
                    if (ticket.investment * ticket.odds < totalInvest) {
                        trigamiTickets.push(ticket);
                    } else {
                        isFullTrigami = false;
                    }
                });

                if (trigamiTickets.length > 0) {
                    trigamiWarning.classList.remove('hidden');
                    if (isFullTrigami) {
                        trigamiWarning.className = 'trigami-box danger-trigami';
                        trigamiWarningText.textContent = `警告：完全なトリガミ状態です！どの馬券が的中しても投資総額（¥${totalInvest.toLocaleString()}）を下回ります。`;
                    } else {
                        trigamiWarning.className = 'trigami-box';
                        const names = trigamiTickets.map(t => `「${t.betName}」`).join(', ');
                        trigamiWarningText.textContent = `注意：${names}が的中した場合、払い戻しが投資総額（¥${totalInvest.toLocaleString()}）を下回ります。`;
                    }
                } else {
                    trigamiWarning.classList.add('hidden');
                }

                const budgetLossLimit = budget - getOverallLoss();
                if (totalInvest > budgetLossLimit) {
                    updateAiAvatarState('state-danger', '👿');
                    aiAdvice.textContent = `警告！このレースへの総投資額 ¥${totalInvest.toLocaleString()} は、本日の残り許容損失（¥${budgetLossLimit.toLocaleString()}）を超えています。`;
                    btnConfirmPurchase.disabled = true;
                } else {
                    let preAdvice = `現在、このレースに ${currentRace.tickets.length} 点の馬券（合計 ¥${totalInvest.toLocaleString()}）が登録されています。`;
                    if (isFullTrigami) {
                        preAdvice += `\n完全トリガミ状態です。AIとしては絶対にこの状態での購入はお勧めしません！`;
                    } else if (trigamiTickets.length > 0) {
                        preAdvice += `\nいくつかの買い目でトリガミが発生しています。無駄な買い目をカットすることをお勧めします。`;
                    } else {
                        preAdvice += `\n買い目のバランスと資金配分は良好です（合成オッズ: ${syntheticOdds.toFixed(2)}倍）。冷静な判断で購入確定へ進みましょう。`;
                    }
                    aiAdvice.textContent = preAdvice;
                    updateAiMoodBasedOnOverall();
                }
            }
        } else if (currentRace.status === "waiting") {
            raceSetupView.classList.add('hidden');
            raceWaitingView.classList.remove('hidden');

            waitingRaceName.textContent = currentRace.raceName || "一般レース";

            purchasedTicketsList.innerHTML = '';
            let totalInvest = 0;
            currentRace.tickets.forEach(ticket => {
                totalInvest += ticket.investment;

                const tr = document.createElement('tr');

                const chkTd = document.createElement('td');
                chkTd.style.textAlign = 'center';
                const chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.className = 'chk-box';
                chk.checked = !!ticket.isWon;
                chk.addEventListener('change', (e) => {
                    ticket.isWon = e.target.checked;
                    saveData();
                    calculateWaitingReturn();
                    updatePayoutCell(payoutTd, ticket);
                });
                chkTd.appendChild(chk);

                const nameTd = document.createElement('td');
                nameTd.textContent = ticket.betName;

                const investTd = document.createElement('td');
                investTd.textContent = `¥${ticket.investment.toLocaleString()}`;

                const oddsTd = document.createElement('td');
                oddsTd.textContent = `${ticket.odds.toFixed(1)}倍`;

                const actualOddsTd = document.createElement('td');
                const actualOddsInput = document.createElement('input');
                actualOddsInput.type = 'number';
                actualOddsInput.className = 'actual-odds-input';
                actualOddsInput.min = '1.0';
                actualOddsInput.step = '0.1';
                actualOddsInput.placeholder = '例: 5.2';
                if (ticket.actualOdds != null) actualOddsInput.value = ticket.actualOdds;
                actualOddsInput.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    ticket.actualOdds = (!isNaN(val) && val >= 1.0) ? val : null;
                    saveData();
                    calculateWaitingReturn();
                    updatePayoutCell(payoutTd, ticket);
                });
                actualOddsTd.appendChild(actualOddsInput);

                const payoutTd = document.createElement('td');
                updatePayoutCell(payoutTd, ticket);

                tr.appendChild(chkTd);
                tr.appendChild(nameTd);
                tr.appendChild(investTd);
                tr.appendChild(oddsTd);
                tr.appendChild(actualOddsTd);
                tr.appendChild(payoutTd);

                purchasedTicketsList.appendChild(tr);
            });

            waitingTotalInvestment.textContent = `¥${totalInvest.toLocaleString()}`;
            calculateWaitingReturn();
        }
    }

    function removeTicket(id) {
        currentRace.tickets = currentRace.tickets.filter(t => t.id !== id);
        saveData();
        renderCurrentRace();
    }

    function getEffectiveOdds(ticket) {
        return (ticket.actualOdds != null) ? ticket.actualOdds : ticket.odds;
    }

    function updatePayoutCell(td, ticket) {
        const effectiveOdds = getEffectiveOdds(ticket);
        const payout = ticket.isWon ? Math.round(ticket.investment * effectiveOdds) : 0;
        const label = ticket.actualOdds != null
            ? `¥${payout.toLocaleString()} <span class="odds-confirmed">確定</span>`
            : `¥${payout.toLocaleString()} <span class="odds-predicted">予想</span>`;
        td.innerHTML = label;
    }

    function calculateWaitingReturn() {
        let totalReturn = 0;
        currentRace.tickets.forEach(ticket => {
            if (ticket.isWon) totalReturn += Math.round(ticket.investment * getEffectiveOdds(ticket));
        });
        waitingCalculatedReturn.textContent = `¥${totalReturn.toLocaleString()}`;
        waitingCalculatedReturn.className = totalReturn > 0 ? "val win-text" : "val";
    }

    // --- 馬券ビルダー ---
    const BET_CONFIG = {
        '単勝':  { maxSelect: 1, ordered: false, useFrames: false, label: '馬番を1頭選んでください' },
        '複勝':  { maxSelect: 1, ordered: false, useFrames: false, label: '馬番を1頭選んでください' },
        '枠連':  { maxSelect: 2, ordered: false, useFrames: true,  label: '枠番を2つ選んでください（順不同）' },
        '馬連':  { maxSelect: 2, ordered: false, useFrames: false, label: '馬番を2頭選んでください（順不同）' },
        '馬単':  { maxSelect: 2, ordered: true,  useFrames: false, label: '1着・2着の順番でタップしてください' },
        'ワイド': { maxSelect: 2, ordered: false, useFrames: false, label: '馬番を2頭選んでください（順不同）' },
        '3連複': { maxSelect: 3, ordered: false, useFrames: false, label: '馬番を3頭選んでください（順不同）' },
        '3連単': { maxSelect: 3, ordered: true,  useFrames: false, label: '1着→2着→3着の順番でタップしてください' },
    };

    let ticketDraft = { betType: null, selections: [] };

    document.querySelectorAll('.bet-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isFinished) return;
            ticketDraft = { betType: btn.dataset.type, selections: [] };
            document.querySelectorAll('.bet-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            horseSelectionArea.classList.remove('hidden');
            ticketAmountRow.style.display = 'none';
            btnAddTicket.style.display = 'none';
            renderHorseGrid();
        });
    });

    horseCountInput.addEventListener('input', () => {
        currentRace.horseCount = parseInt(horseCountInput.value, 10) || 16;
        if (ticketDraft.betType) {
            ticketDraft.selections = [];
            renderHorseGrid();
        }
    });

    function renderHorseGrid() {
        const config = BET_CONFIG[ticketDraft.betType];
        if (!config) return;
        const count = config.useFrames ? 8 : Math.min(Math.max(parseInt(horseCountInput.value, 10) || 16, 2), 18);
        selectionInstruction.textContent = config.label;
        horseGrid.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'horse-btn';
            const selIdx = ticketDraft.selections.indexOf(i);
            const numSpan = document.createElement('span');
            numSpan.className = 'horse-num';
            numSpan.textContent = i;
            btn.appendChild(numSpan);
            if (selIdx !== -1) {
                btn.classList.add('selected');
                if (config.ordered) {
                    const badge = document.createElement('span');
                    badge.className = 'horse-order-badge';
                    badge.textContent = ['1着', '2着', '3着'][selIdx];
                    btn.appendChild(badge);
                }
            }
            btn.addEventListener('click', () => {
                if (isFinished) return;
                const idx = ticketDraft.selections.indexOf(i);
                if (idx !== -1) {
                    ticketDraft.selections = config.ordered
                        ? ticketDraft.selections.slice(0, idx)
                        : ticketDraft.selections.filter((_, j) => j !== idx);
                } else if (ticketDraft.selections.length < config.maxSelect) {
                    ticketDraft.selections.push(i);
                }
                renderHorseGrid();
            });
            horseGrid.appendChild(btn);
        }
        updateSelectionPreview(config);
        const complete = ticketDraft.selections.length === config.maxSelect;
        ticketAmountRow.style.display = complete ? '' : 'none';
        btnAddTicket.style.display = complete ? '' : 'none';
    }

    function updateSelectionPreview(config) {
        const remaining = config.maxSelect - ticketDraft.selections.length;
        if (ticketDraft.selections.length === 0) {
            selectionPreview.textContent = '選択中: なし';
            selectionPreview.className = 'selection-preview';
            return;
        }
        const name = generateBetName(ticketDraft.betType, ticketDraft.selections, config);
        if (remaining > 0) {
            selectionPreview.textContent = `選択中: ${name}（あと${remaining}${config.useFrames ? '枠' : '頭'}選択）`;
            selectionPreview.className = 'selection-preview';
        } else {
            selectionPreview.textContent = `買い目決定: ${name}`;
            selectionPreview.className = 'selection-preview complete';
        }
    }

    function generateBetName(betType, selections, config) {
        if (!config) config = BET_CONFIG[betType];
        const sep = config.ordered ? '→' : '-';
        const arr = config.ordered ? [...selections] : [...selections].sort((a, b) => a - b);
        return `${betType} ${arr.join(sep)}`;
    }

    btnAddTicket.addEventListener('click', () => {
        const config = BET_CONFIG[ticketDraft.betType];
        if (!config || ticketDraft.selections.length !== config.maxSelect) {
            alert('馬券の買い目を選択してください');
            return;
        }
        const invest = parseInt(ticketInvestmentInput.value, 10);
        const odds = parseFloat(ticketOddsInput.value);
        if (isNaN(invest) || invest <= 0) { alert('購入金額を正しく入力してください'); return; }
        if (isNaN(odds) || odds < 1.0) { alert('オッズを正しく入力してください（1.0以上）'); return; }

        const betName = generateBetName(ticketDraft.betType, ticketDraft.selections, config);
        currentRace.raceName = raceNameInput.value.trim();
        currentRace.horseCount = parseInt(horseCountInput.value, 10) || 16;

        currentRace.tickets.push({
            id: Date.now() + Math.random(),
            betName,
            investment: invest,
            odds,
            isWon: false
        });

        ticketDraft = { betType: null, selections: [] };
        saveData();
        renderCurrentRace();
        ticketInvestmentInput.value = '';
        ticketOddsInput.value = '';
    });

    btnConfirmPurchase.addEventListener('click', () => {
        if (currentRace.tickets.length === 0) return;

        aiAdvice.style.display = 'none';
        aiLoader.style.display = 'flex';
        resultCard.style.display = 'none';
        loaderStep.textContent = '🔒 馬券の購入内容を確定中...';

        setTimeout(() => {
            aiLoader.style.display = 'none';
            aiAdvice.style.display = 'block';

            currentRace.raceName = raceNameInput.value.trim();
            currentRace.horseCount = parseInt(horseCountInput.value, 10) || 16;
            currentRace.status = "waiting";
            saveData();
            renderCurrentRace();

            aiAvatar.className = 'ai-avatar';
            aiAvatar.textContent = '🧐';
            aiAdvice.textContent = `レースの購入が確定しました。総投資額は ¥${currentRace.tickets.reduce((sum, t) => sum + t.investment, 0).toLocaleString()} です。レースが終了したら、的中した馬券にチェックを入れてください。`;

            updateDashboard();
        }, 1000);
    });

    btnCancelRace.addEventListener('click', () => {
        if (confirm('このレースの購入を取り消して、馬券の再編集画面に戻りますか？')) {
            currentRace.status = "setup";
            saveData();
            renderCurrentRace();
            updateDashboard();
        }
    });

    // --- タイピング演出 ---
    function typeText(element, text, speed = 20, callback = null) {
        element.innerHTML = '';
        element.classList.add('typing-caret');
        let index = 0;
        isTyping = true;

        function type() {
            if (index < text.length) {
                element.innerHTML += text.charAt(index) === '\n' ? '<br>' : text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing-caret');
                isTyping = false;
                if (callback) callback();
            }
        }
        type();
    }

    // --- AI状態管理 ---
    function updateAiAvatarState(moodClass, avatarChar) {
        aiAvatar.className = 'ai-avatar';
        if (moodClass) aiAvatar.classList.add(moodClass);
        aiAvatar.textContent = avatarChar;
    }

    function updateAiMoodBasedOnOverall() {
        if (history.length === 0) { updateAiAvatarState('', '🤖'); return; }

        let totalInvestment = 0;
        let totalReturn = 0;
        history.forEach(item => {
            totalInvestment += item.investment;
            totalReturn += item.returnAmt;
        });

        const totalBalance = totalReturn - totalInvestment;
        const loss = totalInvestment - totalReturn;
        const lossRatio = budget > 0 ? (loss / budget) * 100 : 0;

        if (totalBalance > 0) {
            updateAiAvatarState('state-win', totalBalance >= budget * 0.5 ? '🤩' : '😊');
        } else if (totalBalance < 0) {
            if (lossRatio >= 100) updateAiAvatarState('state-danger', '👿');
            else if (lossRatio >= 60) updateAiAvatarState('state-danger', '🚨');
            else if (lossRatio >= 20) updateAiAvatarState('state-warn', '⚠️');
            else updateAiAvatarState('state-warn', '🧐');
        } else {
            updateAiAvatarState('', '😐');
        }
    }

    // --- 診断ロジック ---
    function getDiagnosis(invest, ret) {
        let tempInvest = 0;
        let tempReturn = 0;
        history.forEach(item => { tempInvest += item.investment; tempReturn += item.returnAmt; });
        tempInvest += invest;
        tempReturn += ret;

        const tempTotalBalance = tempReturn - tempInvest;
        const tempLoss = tempInvest - tempReturn;
        const tempLossRatio = budget > 0 ? (tempLoss / budget) * 100 : 0;

        let styleClass = '', title = '', advice = '', avatarClass = '', avatarChar = '🤖';
        let metrics = { control: 50, efficiency: 50, risk: 50, mind: 50 };

        if (tempTotalBalance > 0) {
            const profitRatio = (tempTotalBalance / budget) * 100;
            if (profitRatio >= 100) {
                styleClass = 'win-huge'; title = '異次元の神予想！軍資金2倍突破';
                advice = `素晴らしい！トータル収支が設定予算を超える大勝利です！\n\nしかし、ここが最大の落とし穴です。「今日はいくら賭けても負けない」と脳が錯覚しがちです。浮いた利益を確定させて今日の競馬は『完全終了』にするのが最もスマートな選択です！`;
                avatarClass = 'state-win'; avatarChar = '🤩';
                metrics = { control: 75, efficiency: 100, risk: 40, mind: 60 };
            } else if (profitRatio >= 30) {
                styleClass = 'win-medium'; title = '素晴らしい！見事な中勝ち';
                advice = `おめでとうございます！予算の30%以上に相当する利益を獲得できています。\n\n次レースでは欲張って金額を増やさず、当初のベース賭け金を厳守してください。勝っている時の冷静さが最終的に財布を潤す秘訣です。`;
                avatarClass = 'state-win'; avatarChar = '😊';
                metrics = { control: 85, efficiency: 90, risk: 60, mind: 75 };
            } else {
                styleClass = 'win-small'; title = '手堅く勝利！プラス域キープ';
                advice = `お見事！トータル収支はプラス域をキープしています。少しでもプラスで終えることは、競馬においては非常に難しい成果です。\n\n低リスク・低投資のスタイルを崩さずにいきましょう。`;
                avatarClass = 'state-win'; avatarChar = '👍';
                metrics = { control: 90, efficiency: 80, risk: 80, mind: 85 };
            }
        } else if (tempTotalBalance === 0) {
            styleClass = 'draw'; title = 'セーフ！完全なトントン';
            advice = `トータル収支は±0、引き分けです。軍資金を減らさずにスリルを楽しめたのは十分な結果です。\n\nここで熱くなって「次こそは勝つ！」と無理な賭け方をすると、一気にマイナスへ転落します。`;
            avatarClass = ''; avatarChar = '😐';
            metrics = { control: 85, efficiency: 50, risk: 80, mind: 80 };
        } else {
            const lossRatio = tempLossRatio;
            if (lossRatio <= 20) {
                styleClass = 'lose-small'; title = '軽微なマイナス (損失 20%以下)';
                advice = `トータルの損失は予算の20%未満（現在 ${Math.round(lossRatio)}%）です。まだ十分リカバリー可能な小さな傷です。\n\n焦って取り戻そうとしないように。この小さなマイナスを冷静に許容できるかが使いすぎ防止の第一歩です。`;
                avatarClass = 'state-warn'; avatarChar = '🧐';
                metrics = { control: 80, efficiency: 45, risk: 70, mind: 70 };
            } else if (lossRatio <= 40) {
                styleClass = 'lose-small'; title = '警告レベル2 (損失 20%〜40%)';
                advice = `トータルの損失が予算の40%近く（現在 ${Math.round(lossRatio)}%）に達しました。\n\n次のレースは、本当に自信のある本命レースですか？もしそうでないなら、見送って頭を休めることを強くおすすめします。`;
                avatarClass = 'state-warn'; avatarChar = '⚠️';
                metrics = { control: 65, efficiency: 40, risk: 55, mind: 60 };
            } else if (lossRatio <= 60) {
                styleClass = 'lose-medium'; title = '警告レベル3 (損失 40%〜60%)';
                advice = `危険：予算の半分近く（現在 ${Math.round(lossRatio)}%）を失いました！\n\n失った半分を取り返そうと、大穴馬券に高額を突っ込みたくなっていませんか？次レースは賭け金を最低額に落とすか、本日の撤退を視野に入れましょう。`;
                avatarClass = 'state-danger'; avatarChar = '🚨';
                metrics = { control: 45, efficiency: 30, risk: 35, mind: 40 };
            } else if (lossRatio <= 80) {
                styleClass = 'lose-medium'; title = '警告レベル4 (損失 60%〜80%)';
                advice = `厳重注意：予算の80%近く（現在 ${Math.round(lossRatio)}%）を失っています。崖っぷちです！\n\n次のレースに挑むなら、それが本当に今日のラストチャンスです。一番自信のある1つだけ選ぶか、今すぐ終了して残り20%を守り抜くのが最善です。`;
                avatarClass = 'state-danger'; avatarChar = '🚨';
                metrics = { control: 30, efficiency: 20, risk: 20, mind: 25 };
            } else if (lossRatio < 100) {
                styleClass = 'lose-huge'; title = '警告レベル5 (損失 80%〜100%)';
                advice = `極めて深刻：予算がほぼ底をつきました（現在 ${Math.round(lossRatio)}%の損失）。\n\nここでストップできれば、最後の小銭を手元に残せます。今すぐ「今日の競馬を終了する」ボタンを押して帰路につきましょう。`;
                avatarClass = 'state-danger'; avatarChar = '👿';
                metrics = { control: 15, efficiency: 10, risk: 10, mind: 10 };
            } else {
                styleClass = 'lose-huge'; title = '【即刻終了】予算上限オーバー！';
                advice = `【緊急命令：即刻競馬を停止してください】\n本日の上限予算を完全にオーバーしました（損失 ${Math.round(lossRatio)}%）。\n\n絶対に「もう1レースだけ入金して取り返す」などと考えてはいけません。今すぐ投票アプリからログアウトし、財布を閉じましょう！`;
                avatarClass = 'state-danger'; avatarChar = '👿';
                metrics = { control: 0, efficiency: 5, risk: 0, mind: 0 };
            }
        }

        return { styleClass, title, advice, avatarClass, avatarChar, metrics };
    }

    // --- レース結果確定 ---
    btnSubmitResult.addEventListener('click', () => {
        if (isTyping || isFinished) return;

        let totalInvestment = 0;
        let totalReturn = 0;
        currentRace.tickets.forEach(ticket => {
            totalInvestment += ticket.investment;
            if (ticket.isWon) totalReturn += Math.round(ticket.investment * getEffectiveOdds(ticket));
        });

        btnSubmitResult.disabled = true;
        btnCancelRace.disabled = true;

        aiAdvice.style.display = 'none';
        aiLoader.style.display = 'flex';
        resultCard.style.display = 'none';

        const steps = [
            { text: '📊 的中データを判定中...', delay: 0 },
            { text: '💰 払戻金を自動計算中...', delay: 500 },
            { text: '🧠 冷静度マインドをスキャン中...', delay: 1000 },
            { text: '🤖 レース診断レポートを生成中...', delay: 1500 }
        ];
        steps.forEach(step => setTimeout(() => { loaderStep.textContent = step.text; }, step.delay));

        setTimeout(() => {
            aiLoader.style.display = 'none';
            aiAdvice.style.display = 'block';

            const diagnosis = getDiagnosis(totalInvestment, totalReturn);

            resultCard.style.display = 'block';
            resultCard.className = `card result-card ${diagnosis.styleClass}`;
            resultTitle.textContent = diagnosis.title;

            const diff = totalReturn - totalInvestment;
            const sign = diff > 0 ? '+' : '';
            resultIncome.textContent = `¥${sign}${diff.toLocaleString()}`;
            resultIncome.className = `result-income ${diff > 0 ? 'plus' : diff < 0 ? 'minus' : ''}`;

            updateRadarBar(radarControl, diagnosis.metrics.control);
            updateRadarBar(radarEfficiency, diagnosis.metrics.efficiency);
            updateRadarBar(radarRisk, diagnosis.metrics.risk);
            updateRadarBar(radarMind, diagnosis.metrics.mind);

            updateAiAvatarState(diagnosis.avatarClass, diagnosis.avatarChar);

            typeText(aiAdvice, diagnosis.advice, 20, () => {
                const now = new Date();
                const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                history.push({
                    id: Date.now(),
                    time: timeString,
                    raceName: currentRace.raceName || `${history.length + 1}回目レース`,
                    investment: totalInvestment,
                    returnAmt: totalReturn,
                    balance: diff,
                    tickets: JSON.parse(JSON.stringify(currentRace.tickets))
                });

                resetCurrentRace();
                saveData();

                updateDashboard();
                renderHistory();
                initOrUpdateChart();
                renderCurrentRace();

                raceNameInput.value = '';
                ticketInvestmentInput.value = '';
                ticketOddsInput.value = '';

                btnSubmitResult.disabled = false;
                btnCancelRace.disabled = false;

                const overallLoss = getOverallLoss();
                if (budget > 0 && (overallLoss / budget) * 100 >= 100) {
                    lockAppForFinish();
                }
            });
        }, 2000);
    });

    function updateRadarBar(barElement, value) {
        barElement.style.width = '0%';
        barElement.className = 'radar-bar';
        setTimeout(() => {
            barElement.style.width = `${value}%`;
            if (value >= 75) barElement.classList.add('bar-success');
            else if (value >= 40) barElement.classList.add('bar-warning');
            else barElement.classList.add('bar-danger');
        }, 100);
    }

    // --- 今日の競馬を終了 ---
    btnFinishDay.addEventListener('click', () => {
        if (history.length === 0 && currentRace.tickets.length === 0) {
            if (!confirm('まだ1件も記録がありません。このまま本日の競馬を終了しますか？')) return;
        } else {
            if (!confirm('今日の競馬を終了し、結果を確定しますか？終了すると追加の記録ができなくなります。')) return;
        }
        isFinished = true;
        saveData();
        lockAppForFinish();
    });

    function lockAppForFinish() {
        isFinished = true;

        raceNameInput.disabled = true;
        horseCountInput.disabled = true;
        ticketInvestmentInput.disabled = true;
        document.querySelectorAll('.bet-type-btn').forEach(btn => btn.disabled = true);
        ticketOddsInput.disabled = true;
        btnAddTicket.disabled = true;
        btnConfirmPurchase.disabled = true;
        btnFinishDay.disabled = true;
        btnSubmitResult.disabled = true;
        btnCancelRace.disabled = true;
        btnClearHistory.disabled = true;

        renderHistory();
        renderCurrentRace();

        let totalInvestment = 0;
        let totalReturn = 0;
        history.forEach(item => { totalInvestment += item.investment; totalReturn += item.returnAmt; });

        const totalBalance = totalReturn - totalInvestment;
        const recoveryRate = totalInvestment > 0 ? Math.round((totalReturn / totalInvestment) * 100) : 0;
        const loss = totalInvestment - totalReturn;
        const lossRatio = budget > 0 ? (loss / budget) * 100 : 0;

        const sign = totalBalance > 0 ? '+' : '';
        finishBalanceEl.textContent = `¥${sign}${totalBalance.toLocaleString()}`;
        finishBalanceEl.className = `val ${totalBalance > 0 ? 'plus' : totalBalance < 0 ? 'minus' : ''}`;
        finishRecoveryRateEl.textContent = `${recoveryRate}%`;
        finishRecoveryRateEl.className = `val ${recoveryRate >= 100 ? 'plus' : recoveryRate >= 50 ? 'warning' : 'minus'}`;
        finishRaceCountEl.textContent = `${history.length}回`;

        let finishAdvice = '';
        if (totalBalance > 0) {
            updateAiAvatarState('state-win', '🤩');
            finishAdvice = `素晴らしい！本日は最終的にプラス収支で見事に逃げ切りましたね！\n回収率は驚異の ${recoveryRate}% です。勝っている段階で「レース終了」を自ら押して利益を確定させたその自制心は、プロの馬券師並みです。今日の勝ち分は即座に出金して美味しいものでも食べてください！`;
        } else if (totalBalance === 0) {
            updateAiAvatarState('', '😐');
            finishAdvice = `本日はトントン（プラマイゼロ）での決着となりました。\n実質的に損失なく楽しめたのは良い結果です。次は少しだけ回収率を高められるよう、今回の買い方を振り返ってみましょう。お疲れ様でした！`;
        } else {
            if (lossRatio >= 100) {
                updateAiAvatarState('state-danger', '👿');
                finishAdvice = `警告：本日は予算枠をすべて使い果たす結果（予算比 ${Math.round(lossRatio)}%の損失）となりました。\n絶対に「他からお金を持ってきて取り返す」勝負はしないでください。まずは財布を閉じて、冷静になる時間を作りましょう。`;
            } else if (lossRatio >= 50) {
                updateAiAvatarState('state-danger', '🚨');
                finishAdvice = `本日は予算の半分以上（予算比 ${Math.round(lossRatio)}%の損失）を失う手痛い敗戦となりました。\nしかし、すべてを溶かしきる前にここで撤退できたのは大きな一歩です。今回の反省を次の戦いに活かしましょう。`;
            } else {
                updateAiAvatarState('state-warn', '🧐');
                finishAdvice = `本日のトータル収支は微減（予算比 ${Math.round(lossRatio)}%の損失）となりました。\n損失を軽微な範囲に抑えて終了できたのは、優れた自己コントロール力の証です。お疲れ様でした！`;
            }
        }

        finishSummaryCard.classList.remove('hidden');
        inputCard.classList.add('hidden');
        typeText(finishAiAdviceEl, finishAdvice, 15);
    }

    // --- 日付リセット（V6: アーカイブしてから新しい日へ） ---
    btnResetDay.addEventListener('click', () => {
        if (confirm('本日の記録を保存して、予算設定から新しく始めますか？')) {
            archiveCurrentDay();

            localStorage.removeItem('keiba_v6_budget');
            localStorage.removeItem('keiba_v6_history');
            localStorage.removeItem('keiba_v6_finished');
            localStorage.removeItem('keiba_v6_current_race');
            localStorage.removeItem('keiba_v3_budget');
            localStorage.removeItem('keiba_v3_history');
            localStorage.removeItem('keiba_v3_finished');
            localStorage.removeItem('keiba_v3_current_race');
            localStorage.removeItem('keiba_v2_budget');
            localStorage.removeItem('keiba_v2_history');
            localStorage.removeItem('keiba_v2_finished');

            budget = 0;
            history = [];
            isFinished = false;
            resetCurrentRace();

            raceNameInput.disabled = false;
            horseCountInput.disabled = false;
            ticketInvestmentInput.disabled = false;
            document.querySelectorAll('.bet-type-btn').forEach(btn => btn.disabled = false);
            ticketOddsInput.disabled = false;
            btnAddTicket.disabled = false;
            btnConfirmPurchase.disabled = false;
            btnFinishDay.disabled = false;
            btnSubmitResult.disabled = false;
            btnCancelRace.disabled = false;

            finishSummaryCard.classList.add('hidden');
            inputCard.classList.remove('hidden');
            mainAppContent.classList.add('hidden');
            budgetSetupSection.classList.remove('hidden');

            if (keibaChart) { keibaChart.destroy(); keibaChart = null; }

            renderPastDays();
        }
    });

    // --- Chart.js グラフ ---
    function initOrUpdateChart() {
        const ctx = document.getElementById('keiba-chart').getContext('2d');
        const labels = ['開始'];
        const chartData = [0];

        let cumulativeBalance = 0;
        history.forEach((item, index) => {
            cumulativeBalance += (item.returnAmt - item.investment);
            labels.push(item.raceName || `${index + 1}戦目`);
            chartData.push(cumulativeBalance);
        });

        const limitLineData = Array(chartData.length).fill(-budget);

        if (keibaChart) {
            keibaChart.data.labels = labels;
            keibaChart.data.datasets[0].data = chartData;
            keibaChart.data.datasets[1].data = limitLineData;
            keibaChart.options.scales.y.min = Math.min(-budget * 1.2, ...chartData) - 1000;
            keibaChart.options.scales.y.max = Math.max(budget * 0.5, ...chartData) + 1000;
            keibaChart.update();
        } else {
            keibaChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'トータル収支',
                            data: chartData,
                            borderColor: '#8b5cf6',
                            borderWidth: 3,
                            backgroundColor: 'rgba(139, 92, 246, 0.15)',
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#a78bfa',
                            pointBorderColor: '#fff',
                            pointRadius: 5,
                            pointHoverRadius: 7
                        },
                        {
                            label: '予算上限ライン',
                            data: limitLineData,
                            borderColor: '#ef4444',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false,
                            pointRadius: 0,
                            pointHoverRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#e5e7eb',
                                font: { family: "'Inter', 'Noto Sans JP', sans-serif", size: 11 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    let label = ctx.dataset.label ? ctx.dataset.label + ': ' : '';
                                    if (ctx.parsed.y !== null) label += '¥' + ctx.parsed.y.toLocaleString();
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#9ca3af', font: { family: "'Inter', 'Noto Sans JP', sans-serif" } }
                        },
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: {
                                color: '#9ca3af',
                                font: { family: "'Inter', 'Noto Sans JP', sans-serif" },
                                callback: (value) => '¥' + value.toLocaleString()
                            },
                            min: Math.min(-budget * 1.2, ...chartData) - 1000,
                            max: Math.max(budget * 0.5, ...chartData) + 1000
                        }
                    }
                }
            });
        }
    }

    // アプリ起動
    loadData();
});
