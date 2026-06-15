// 競馬使いすぎ防止サポーター AI (v3) - コアスクリプト

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    
    // 画面セクション
    const budgetSetupSection = document.getElementById('budget-setup-section');
    const mainAppContent = document.getElementById('main-app-content');
    const finishSummaryCard = document.getElementById('finish-summary-card');
    const inputCard = document.getElementById('input-card');
    
    // V3用ビュー切替
    const raceSetupView = document.getElementById('race-setup-view');
    const raceWaitingView = document.getElementById('race-waiting-view');
    
    // 予算設定
    const budgetForm = document.getElementById('budget-form');
    const budgetInput = document.getElementById('budget-input');
    const displayBudgetEl = document.getElementById('display-budget');
    
    // ダッシュボード・進捗バー
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressStatus = document.getElementById('progress-status');
    const totalInvestmentEl = document.getElementById('total-investment');
    const totalReturnEl = document.getElementById('total-return');
    const totalBalanceEl = document.getElementById('total-balance');
    const cardTotalBalance = document.getElementById('card-total-balance');
    
    // V4 馬券追加フォーム
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
    
    // V3 事前診断
    const preDiagnoseArea = document.getElementById('pre-diagnose-area');
    const preTotalInvestmentEl = document.getElementById('pre-total-investment');
    const preSyntheticOddsEl = document.getElementById('pre-synthetic-odds');
    const trigamiWarning = document.getElementById('trigami-warning');
    const trigamiWarningText = document.getElementById('trigami-warning-text');
    
    const btnConfirmPurchase = document.getElementById('btn-confirm-purchase');
    const btnFinishDay = document.getElementById('btn-finish-day');
    
    // V3 結果入力待ち
    const waitingRaceName = document.getElementById('waiting-race-name');
    const purchasedTicketsList = document.getElementById('purchased-tickets-list');
    const waitingTotalInvestment = document.getElementById('waiting-total-investment');
    const waitingCalculatedReturn = document.getElementById('waiting-calculated-return');
    const btnSubmitResult = document.getElementById('btn-submit-result');
    const btnCancelRace = document.getElementById('btn-cancel-race');
    
    // AIアバター・メッセージ
    const aiAvatar = document.getElementById('ai-avatar');
    const aiAdvice = document.getElementById('ai-advice');
    const aiLoader = document.getElementById('ai-loader');
    const loaderStep = document.getElementById('loader-step');
    
    // 診断レポート（確定後の直近レース）
    const resultCard = document.getElementById('result-card');
    const resultTitle = document.getElementById('result-title');
    const resultIncome = document.getElementById('result-income');
    const radarControl = document.getElementById('radar-control');
    const radarEfficiency = document.getElementById('radar-efficiency');
    const radarRisk = document.getElementById('radar-risk');
    const radarMind = document.getElementById('radar-mind');
    
    // 終了サマリー
    const finishBalanceEl = document.getElementById('finish-balance');
    const finishRecoveryRateEl = document.getElementById('finish-recovery-rate');
    const finishRaceCountEl = document.getElementById('finish-race-count');
    const finishAiAdviceEl = document.getElementById('finish-ai-advice');
    const btnResetDay = document.getElementById('btn-reset-day');
    
    // 履歴リスト
    const historyList = document.getElementById('history-list');
    const btnClearHistory = document.getElementById('btn-clear-history');
    const noHistoryMsg = document.getElementById('no-history-msg');
    
    // --- 状態変数 ---
    let budget = 0;
    let history = [];
    let isFinished = false;
    let isTyping = false;
    let keibaChart = null;
    
    // V3用状態変数
    let currentRace = {
        raceName: "",
        horseCount: 16,
        tickets: [],
        status: "setup"
    };

    // --- ローカルストレージ同期 ---
    
    function resetCurrentRace() {
        currentRace = {
            raceName: "",
            horseCount: 16,
            tickets: [],
            status: "setup"
        };
    }
    
    function loadData() {
        const storedBudget = localStorage.getItem('keiba_v3_budget') || localStorage.getItem('keiba_v2_budget');
        const storedHistory = localStorage.getItem('keiba_v3_history');
        const storedFinished = localStorage.getItem('keiba_v3_finished');
        const storedCurrentRace = localStorage.getItem('keiba_v3_current_race');
        
        if (storedBudget) {
            budget = parseInt(storedBudget, 10);
            displayBudgetEl.textContent = `¥${budget.toLocaleString()}`;
            
            // メイン画面へ切り替え
            budgetSetupSection.classList.add('hidden');
            mainAppContent.classList.remove('hidden');
            
            if (storedHistory) {
                try {
                    history = JSON.parse(storedHistory);
                } catch (e) {
                    history = [];
                }
            } else {
                // V2履歴の移行対応
                const v2History = localStorage.getItem('keiba_v2_history');
                if (v2History) {
                    try {
                        const parsed = JSON.parse(v2History);
                        history = parsed.map(item => ({
                            id: item.id,
                            time: item.time,
                            raceName: item.raceName,
                            investment: item.investment,
                            returnAmt: item.returnAmt,
                            balance: item.balance,
                            tickets: [
                                { id: Date.now(), betName: "一括登録", investment: item.investment, odds: item.investment > 0 ? (item.returnAmt / item.investment) : 0, isWon: item.returnAmt > 0 }
                            ]
                        }));
                    } catch (e) {
                        history = [];
                    }
                }
            }
            
            if (storedFinished === 'true') {
                isFinished = true;
            }
            
            if (storedCurrentRace) {
                try {
                    currentRace = JSON.parse(storedCurrentRace);
                } catch (e) {
                    resetCurrentRace();
                }
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
    }
    
    function saveData() {
        localStorage.setItem('keiba_v3_budget', budget.toString());
        localStorage.setItem('keiba_v3_history', JSON.stringify(history));
        localStorage.setItem('keiba_v3_finished', isFinished ? 'true' : 'false');
        localStorage.setItem('keiba_v3_current_race', JSON.stringify(currentRace));
    }

    // --- 予算設定の開始 ---
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
        
        // 画面アニメーション切り替え
        budgetSetupSection.classList.add('hidden');
        mainAppContent.classList.remove('hidden');
        
        // 初期アドバイス
        aiAvatar.className = 'ai-avatar';
        aiAvatar.textContent = '🤖';
        aiAdvice.textContent = `本日の予算 ¥${budget.toLocaleString()} でサポーターAIを起動しました。馬券を登録して診断を開始しましょう！`;
        
        updateDashboard();
        renderHistory();
        initOrUpdateChart();
        renderCurrentRace();
    });

    // --- ダッシュボード＆プログレスバーの更新 ---
    function updateDashboard() {
        let totalInvestment = 0;
        let totalReturn = 0;
        
        history.forEach(item => {
            totalInvestment += item.investment;
            totalReturn += item.returnAmt;
        });
        
        // V3: 購入確定して結果待ち状態のレース投資額も本日総投資に加算する
        if (currentRace && currentRace.status === "waiting") {
            const waitingInvest = currentRace.tickets.reduce((sum, t) => sum + t.investment, 0);
            totalInvestment += waitingInvest;
        }
        
        const totalBalance = totalReturn - totalInvestment;
        
        totalInvestmentEl.textContent = `¥${totalInvestment.toLocaleString()}`;
        totalReturnEl.textContent = `¥${totalReturn.toLocaleString()}`;
        
        const sign = totalBalance > 0 ? '+' : '';
        totalBalanceEl.textContent = `¥${sign}${totalBalance.toLocaleString()}`;
        
        // トータル収支のカード色変更
        cardTotalBalance.className = 'summary-card';
        if (totalBalance > 0) {
            cardTotalBalance.classList.add('status-win');
        } else if (totalBalance < 0) {
            cardTotalBalance.classList.add('status-lose');
        }
        
        // 損失進捗の計算
        const loss = totalInvestment - totalReturn;
        let lossRatio = 0;
        if (budget > 0) {
            lossRatio = Math.max(0, (loss / budget) * 100);
        }
        
        // 進捗バー表示の更新
        const displayRatio = Math.min(100, lossRatio);
        progressBar.style.width = `${displayRatio}%`;
        progressPercentage.textContent = `${Math.round(lossRatio)}%`;
        
        // 進捗度に応じたバーの色とステータス文言
        progressBar.className = 'progress-bar-fill';
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
    
    // 現在の累積損失を計算するヘルパー
    function getOverallLoss() {
        let totalInvestment = 0;
        let totalReturn = 0;
        history.forEach(item => {
            totalInvestment += item.investment;
            totalReturn += item.returnAmt;
        });
        return Math.max(0, totalInvestment - totalReturn);
    }

    // --- 履歴リストの描画 (V3: アコーディオン展開方式) ---
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
            
            // 親行 (レースサマリー)
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
            
            // アコーディオントグル処理
            trParent.addEventListener('click', () => {
                const detailRow = document.getElementById(detailId);
                if (detailRow) {
                    const isHidden = detailRow.classList.contains('hidden');
                    // 他を閉じる
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

            // 子行 (詳細馬券リスト)
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
                noDetails.style.color = 'var(--text-muted)';
                noDetails.style.fontSize = '0.8rem';
                noDetails.textContent = '詳細な馬券データはありません。';
                ticketsBox.appendChild(noDetails);
            }
            
            detailTd.appendChild(ticketsBox);
            trDetail.appendChild(detailTd);
            
            historyList.appendChild(trParent);
            historyList.appendChild(trDetail);
        });
    }

    // 履歴個別削除
    function deleteHistoryItem(id) {
        if (isFinished) return;
        history = history.filter(item => item.id !== id);
        saveData();
        updateDashboard();
        renderHistory();
        initOrUpdateChart();
        updateAiMoodBasedOnOverall();
    }

    // 全履歴クリア
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
            
            // AIリセット
            aiAvatar.className = 'ai-avatar';
            aiAvatar.textContent = '🤖';
            aiAdvice.textContent = '履歴をクリアしました。新しい戦績を入力して診断を始めましょう。';
            resultCard.style.display = 'none';
        }
    });

    // --- V3: 進行中レースの描画と事前診断 ---
    function renderCurrentRace() {
        if (currentRace.status === "setup") {
            raceSetupView.classList.remove('hidden');
            raceWaitingView.classList.add('hidden');
            
            // 値の復元
            raceNameInput.value = currentRace.raceName || '';
            horseCountInput.value = currentRace.horseCount || 16;

            // 馬券ドラフトリセット
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
                    const predictedReturn = Math.round(ticket.investment * ticket.odds);
                    predictedTd.textContent = `¥${predictedReturn.toLocaleString()}`;
                    
                    const actionTd = document.createElement('td');
                    actionTd.style.textAlign = 'center';
                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-delete-row';
                    delBtn.innerHTML = '&times;';
                    delBtn.addEventListener('click', () => {
                        removeTicket(ticket.id);
                    });
                    actionTd.appendChild(delBtn);
                    
                    tr.appendChild(nameTd);
                    tr.appendChild(investTd);
                    tr.appendChild(oddsTd);
                    tr.appendChild(predictedTd);
                    tr.appendChild(actionTd);
                    
                    addedTicketsList.appendChild(tr);
                });
                
                // 合成オッズの算出
                const syntheticOdds = sumReciprocalOdds > 0 ? (1 / sumReciprocalOdds) : 0;
                
                preTotalInvestmentEl.textContent = `¥${totalInvest.toLocaleString()}`;
                preSyntheticOddsEl.textContent = `${syntheticOdds.toFixed(2)}倍`;
                
                // トリガミ警告
                let trigamiTickets = [];
                let isFullTrigami = true;
                
                currentRace.tickets.forEach(ticket => {
                    const payout = ticket.investment * ticket.odds;
                    if (payout < totalInvest) {
                        trigamiTickets.push(ticket);
                    } else {
                        isFullTrigami = false;
                    }
                });
                
                if (trigamiTickets.length > 0) {
                    trigamiWarning.classList.remove('hidden');
                    if (isFullTrigami) {
                        trigamiWarning.className = 'trigami-box danger-trigami';
                        trigamiWarningText.textContent = `警告：完全なトリガミ状態です！どの馬券が的中しても投資総額（¥${totalInvest.toLocaleString()}）を下回ります。買い目を絞るか、資金配分を見直してください。`;
                    } else {
                        trigamiWarning.className = 'trigami-box';
                        const names = trigamiTickets.map(t => `「${t.betName}」`).join(', ');
                        trigamiWarningText.textContent = `注意：トリガミの買い目があります。${names}が的中した場合、払い戻しが投資総額（¥${totalInvest.toLocaleString()}）を下回ります。`;
                    }
                } else {
                    trigamiWarning.classList.add('hidden');
                }
                
                // AIの事前アドバイス
                const budgetLossLimit = budget - getOverallLoss();
                if (totalInvest > budgetLossLimit) {
                    aiAvatar.className = 'ai-avatar state-danger';
                    aiAvatar.textContent = '👿';
                    aiAdvice.textContent = `警告！このレースへの総投資額 ¥${totalInvest.toLocaleString()} は、本日の残り許容損失（¥${budgetLossLimit.toLocaleString()}）を超えています。これ以上は購入できません！`;
                    btnConfirmPurchase.disabled = true;
                } else {
                    let preAdvice = `現在、このレースに ${currentRace.tickets.length} 点の馬券（合計 ¥${totalInvest.toLocaleString()}）が登録されています。`;
                    if (isFullTrigami) {
                        preAdvice += `\n現在、どの馬券が当たっても赤字になる「完全トリガミ」です。AIとしては絶対にこの状態での購入はお勧めしません！`;
                    } else if (trigamiTickets.length > 0) {
                        preAdvice += `\nいくつかの買い目でトリガミ（ガミる）が発生しています。的中時の利益を確保するため、オッズの低い本命馬の購入比率を上げるか、無駄な買い目をカットすることをお勧めします。`;
                    } else {
                        preAdvice += `\n買い目のバランスと資金配分は良好です（合成オッズ: ${syntheticOdds.toFixed(2)}倍）。熱くならずに冷静な判断で購入確定へ進みましょう。`;
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
                if (ticket.actualOdds != null) {
                    actualOddsInput.value = ticket.actualOdds;
                }
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
        const label = ticket.actualOdds != null ? `¥${payout.toLocaleString()} <span class="odds-confirmed">確定</span>` : `¥${payout.toLocaleString()} <span class="odds-predicted">予想</span>`;
        td.innerHTML = label;
    }

    function calculateWaitingReturn() {
        let totalReturn = 0;
        currentRace.tickets.forEach(ticket => {
            if (ticket.isWon) {
                totalReturn += Math.round(ticket.investment * getEffectiveOdds(ticket));
            }
        });
        waitingCalculatedReturn.textContent = `¥${totalReturn.toLocaleString()}`;

        if (totalReturn > 0) {
            waitingCalculatedReturn.className = "val win-text";
        } else {
            waitingCalculatedReturn.className = "val";
        }
    }

    // --- V4: 馬券ビルダー ---
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

    // --- 馬券追加のクリックイベント ---
    btnAddTicket.addEventListener('click', () => {
        const config = BET_CONFIG[ticketDraft.betType];
        if (!config || ticketDraft.selections.length !== config.maxSelect) {
            alert('馬券の買い目を選択してください');
            return;
        }
        const invest = parseInt(ticketInvestmentInput.value, 10);
        const odds = parseFloat(ticketOddsInput.value);
        if (isNaN(invest) || invest <= 0) {
            alert('購入金額を正しく入力してください');
            return;
        }
        if (isNaN(odds) || odds < 1.0) {
            alert('オッズを正しく入力してください（1.0以上）');
            return;
        }
        const betName = generateBetName(ticketDraft.betType, ticketDraft.selections, config);
        currentRace.raceName = raceNameInput.value.trim();
        currentRace.horseCount = parseInt(horseCountInput.value, 10) || 16;
        const newTicket = {
            id: Date.now() + Math.random(),
            betName: betName,
            investment: invest,
            odds: odds,
            isWon: false
        };
        currentRace.tickets.push(newTicket);
        ticketDraft = { betType: null, selections: [] };
        saveData();
        renderCurrentRace();
        ticketInvestmentInput.value = '';
        ticketOddsInput.value = '';
    });

    // --- 購入確定 (結果待ちへ) ---
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
            aiAdvice.textContent = `レースの購入が確定しました。総投資額は ¥${currentRace.tickets.reduce((sum, t) => sum + t.investment, 0).toLocaleString()} です。レースが終了したら、的中した馬券にチェックを入れてください。健闘を祈ります！`;
            
            updateDashboard();
        }, 1000);
    });

    // --- 購入取り消し ---
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
                if (text.substr(index, 1) === '\n') {
                    element.innerHTML += '<br>';
                } else {
                    element.innerHTML += text.charAt(index);
                }
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

    // --- AIの表情・アバター更新 ---
    function updateAiAvatarState(moodClass, avatarChar) {
        aiAvatar.className = 'ai-avatar';
        if (moodClass) {
            aiAvatar.classList.add(moodClass);
        }
        aiAvatar.textContent = avatarChar;
    }

    function updateAiMoodBasedOnOverall() {
        if (history.length === 0) {
            updateAiAvatarState('', '🤖');
            return;
        }

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
            if (totalBalance >= budget * 0.5) {
                updateAiAvatarState('state-win', '🤩');
            } else {
                updateAiAvatarState('state-win', '😊');
            }
        } else if (totalBalance < 0) {
            if (lossRatio >= 100) {
                updateAiAvatarState('state-danger', '👿');
            } else if (lossRatio >= 60) {
                updateAiAvatarState('state-danger', '🚨');
            } else if (lossRatio >= 20) {
                updateAiAvatarState('state-warn', '⚠️');
            } else {
                updateAiAvatarState('state-warn', '🧐');
            }
        } else {
            updateAiAvatarState('', '😐');
        }
    }

    // --- 診断ロジック (V3) ---
    function getDiagnosis(invest, ret) {
        // 今回の入力を反映した「仮のトータル収支」をベースに診断
        let tempInvest = 0;
        let tempReturn = 0;
        history.forEach(item => {
            tempInvest += item.investment;
            tempReturn += item.returnAmt;
        });
        tempInvest += invest;
        tempReturn += ret;

        const tempTotalBalance = tempReturn - tempInvest;
        const tempLoss = tempInvest - tempReturn;
        const tempLossRatio = budget > 0 ? (tempLoss / budget) * 100 : 0;

        let styleClass = '';
        let title = '';
        let advice = '';
        let avatarClass = '';
        let avatarChar = '🤖';
        let metrics = { control: 50, efficiency: 50, risk: 50, mind: 50 };

        if (tempTotalBalance > 0) {
            const profit = tempTotalBalance;
            const profitRatio = (profit / budget) * 100;

            if (profitRatio >= 100) {
                styleClass = 'win-huge';
                title = '異次元の神予想！軍資金2倍突破';
                advice = `素晴らしい！トータル収支が設定予算（軍資金）を超える大勝利となっています！今日の競馬脳は完全に冴え渡っていますね。
                
しかし、ここが最大の落とし穴です。「今日はいくら賭けても負けない」と脳が錯覚し、次のレースで賭け金を急激に跳ね上げがちです。浮いた利益をすべて失う前に、利益を確定させて今日の競馬は『完全終了』にするのが最もスマートなギャンブラーの選択です！`;
                avatarClass = 'state-win';
                avatarChar = '🤩';
                metrics = { control: 75, efficiency: 100, risk: 40, mind: 60 };
            } else if (profitRatio >= 30) {
                styleClass = 'win-medium';
                title = '素晴らしい！見事な中勝ち';
                advice = `おめでとうございます！予算の30%以上に相当する、しっかりとした利益を獲得できています。
                
戦略が綺麗にハマりましたね。この流れを維持するためにも、次レースでは欲張って金額を増やさず、当初のベース賭け金を厳守してください。勝っている時の冷静さこそが、最終的に財布を潤す秘訣です。`;
                avatarClass = 'state-win';
                avatarChar = '😊';
                metrics = { control: 85, efficiency: 90, risk: 60, mind: 75 };
            } else {
                styleClass = 'win-small';
                title = '手堅く勝利！プラス域キープ';
                advice = `お見事！トータル収支はプラス域をキープしています。少しでもプラスで終えることは、競馬においては非常に難しい成果です。
                
この調子で堅実にいきましょう。わずかな利益でも、それを次の大勝負の資金にして溶かしてしまっては意味がありません。低リスク・低投資のスタイルを崩さずにいきましょう。`;
                avatarClass = 'state-win';
                avatarChar = '👍';
                metrics = { control: 90, efficiency: 80, risk: 80, mind: 85 };
            }
        } 
        else if (tempTotalBalance === 0) {
            styleClass = 'draw';
            title = 'セーフ！完全なトントン';
            advice = `トータル収支は±0、ちょうど引き分けです。軍資金を減らさずにスリルを楽しめたのは、十分な結果といえます。
            
ここで熱くなって「次こそは勝つ！」と無理な賭け方をすると、一気にマイナスへ転落します。マイナスになる前に終了する勇気も持っておきましょう。`;
            avatarClass = '';
            avatarChar = '😐';
            metrics = { control: 85, efficiency: 50, risk: 80, mind: 80 };
        } 
        else {
            const lossRatio = tempLossRatio;

            if (lossRatio <= 20) {
                styleClass = 'lose-small';
                title = '軽微なマイナス (損失 20%以下)';
                advice = `トータルの損失は予算の20%未満（現在 ${Math.round(lossRatio)}%）です。まだ十分リカバリー可能な小さな傷です。
                
ここで焦って取り戻そうと、予定にないレースに手を出したり、賭け金を2倍にしたりしないように気を引き締めてください。この小さなマイナスを冷静に許容できるかが、使いすぎ防止の第一歩です。`;
                avatarClass = 'state-warn';
                avatarChar = '🧐';
                metrics = { control: 80, efficiency: 45, risk: 70, mind: 70 };
            } 
            else if (lossRatio <= 40) {
                styleClass = 'lose-small';
                title = '警告レベル2 (損失 20%〜40%)';
                advice = `トータルの損失が予算の40%近く（現在 ${Math.round(lossRatio)}%）に達しました。イエローカードの準備段階です。
                
「少し負けが込んできたな」と感じていませんか？次のレースは、本当に自信のある本命レースですか？もしそうでないなら、見送って頭を休めることを強くおすすめします。一歩引いて、冷静さを取り戻しましょう。`;
                avatarClass = 'state-warn';
                avatarChar = '⚠️';
                metrics = { control: 65, efficiency: 40, risk: 55, mind: 60 };
            } 
            else if (lossRatio <= 60) {
                styleClass = 'lose-medium';
                title = '警告レベル3 (損失 40%〜60%)';
                advice = `危険：予算の半分近く（現在 ${Math.round(lossRatio)}%）を失いました！
                
典型的な「熱くなりやすいゾーン」に入っています。失った半分を取り返そうと、オッズの高い大穴馬券に高額を突っ込みたくなっていませんか？冷静さを欠いた予想は、さらなる負けを引き寄せるだけです。次レースは賭け金を最低額に落とすか、本日の撤退を視野に入れましょう。`;
                avatarClass = 'state-danger';
                avatarChar = '🚨';
                metrics = { control: 45, efficiency: 30, risk: 35, mind: 40 };
            } 
            else if (lossRatio <= 80) {
                styleClass = 'lose-medium';
                title = '警告レベル4 (損失 60%〜80%)';
                advice = `厳重注意：予算の80%近く（現在 ${Math.round(lossRatio)}%）を失っています。崖っぷちです！
                
もうほぼ予算の限界が迫っています。これ以上の負けは、本日の「完全敗北」を意味します。もし次のレースに挑むなら、それが本当に今日のラストチャンスです。一番自信のあるレースを1つだけ選ぶか、今すぐ「今日のレースを終了する」を押して予算の残り20%を守り抜くのが最善です。`;
                avatarClass = 'state-danger';
                avatarChar = '🚨';
                metrics = { control: 30, efficiency: 20, risk: 20, mind: 25 };
            } 
            else if (lossRatio < 100) {
                styleClass = 'lose-huge';
                title = '警告レベル5 (損失 80%〜100%)';
                advice = `極めて深刻：予算がほぼ底をつきました（現在 ${Math.round(lossRatio)}%の損失）。
                
もはや大逆転を狙って無茶な賭けをしても、傷口を広げるだけです。ここでストップできれば、最後の小銭（残り20%未満の予算）を手元に残せます。負けを認め、傷がこれ以上深くならないうちに、今すぐ「今日のレースを終了する」ボタンを押して帰路につきましょう。`;
                avatarClass = 'state-danger';
                avatarChar = '👿';
                metrics = { control: 15, efficiency: 10, risk: 10, mind: 10 };
            } 
            else {
                styleClass = 'lose-huge';
                title = '【即刻終了】予算上限オーバー！';
                advice = `【緊急命令：即刻競馬を停止してください】
本日の上限予算を完全にオーバーしました（損失 ${Math.round(lossRatio)}%）。これはあなたが最初に設定したルールに違反しています！
                
絶対に「もう1レースだけ入金して取り返す」などと考えてはいけません。それはさらなる深みにハマる最悪のスパイラルです。今すぐ投票アプリからログアウトし、財布を閉じましょう。今日のゲームは終了です！`;
                avatarClass = 'state-danger';
                avatarChar = '👿';
                metrics = { control: 0, efficiency: 5, risk: 0, mind: 0 };
            }
        }

        return {
            styleClass,
            title,
            advice,
            avatarClass,
            avatarChar,
            metrics
        };
    }

    // --- レース結果確定の実行 ---
    btnSubmitResult.addEventListener('click', () => {
        if (isTyping || isFinished) return;
        
        let totalInvestment = 0;
        let totalReturn = 0;
        currentRace.tickets.forEach(ticket => {
            totalInvestment += ticket.investment;
            if (ticket.isWon) {
                totalReturn += Math.round(ticket.investment * getEffectiveOdds(ticket));
            }
        });

        btnSubmitResult.disabled = true;
        btnCancelRace.disabled = true;

        // ローディング演出
        aiAdvice.style.display = 'none';
        aiLoader.style.display = 'flex';
        resultCard.style.display = 'none';

        const steps = [
            { text: '📊 的中データを判定中...', delay: 0 },
            { text: '💰 払戻金を自動計算中...', delay: 500 },
            { text: '🧠 冷静度マインドをスキャン中...', delay: 1000 },
            { text: '🤖 レース診断レポートを生成中...', delay: 1500 }
        ];

        steps.forEach(step => {
            setTimeout(() => {
                loaderStep.textContent = step.text;
            }, step.delay);
        });

        setTimeout(() => {
            aiLoader.style.display = 'none';
            aiAdvice.style.display = 'block';

            const diagnosis = getDiagnosis(totalInvestment, totalReturn);

            // 結果カードの表示
            resultCard.style.display = 'block';
            resultCard.className = `card result-card ${diagnosis.styleClass}`;
            resultTitle.textContent = diagnosis.title;
            
            const diff = totalReturn - totalInvestment;
            const sign = diff > 0 ? '+' : '';
            resultIncome.textContent = `¥${sign}${diff.toLocaleString()}`;
            resultIncome.className = `result-income ${diff > 0 ? 'plus' : diff < 0 ? 'minus' : ''}`;

            // レーダーバー更新
            updateRadarBar(radarControl, diagnosis.metrics.control);
            updateRadarBar(radarEfficiency, diagnosis.metrics.efficiency);
            updateRadarBar(radarRisk, diagnosis.metrics.risk);
            updateRadarBar(radarMind, diagnosis.metrics.mind);

            // AIアバター状態の反映
            updateAiAvatarState(diagnosis.avatarClass, diagnosis.avatarChar);

            // AIのアドバイス出力
            typeText(aiAdvice, diagnosis.advice, 20, () => {
                // 履歴に追加
                const now = new Date();
                const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                
                const newLog = {
                    id: Date.now(),
                    time: timeString,
                    raceName: currentRace.raceName || `${history.length + 1}回目レース`,
                    investment: totalInvestment,
                    returnAmt: totalReturn,
                    balance: diff,
                    tickets: JSON.parse(JSON.stringify(currentRace.tickets))
                };

                history.push(newLog);
                resetCurrentRace();
                saveData();
                
                updateDashboard();
                renderHistory();
                initOrUpdateChart();
                renderCurrentRace();

                // フォームのクリア
                raceNameInput.value = '';
                ticketInvestmentInput.value = '';
                ticketOddsInput.value = '';

                btnSubmitResult.disabled = false;
                btnCancelRace.disabled = false;

                // 予算オーバー時は強制終了処理
                const overallLoss = getOverallLoss();
                const lossRatio = budget > 0 ? (overallLoss / budget) * 100 : 0;

                if (lossRatio >= 100) {
                    lockAppForFinish();
                }
            });

        }, 2000);
    });

    // レーダーバー更新補助
    function updateRadarBar(barElement, value) {
        barElement.style.width = '0%';
        barElement.className = 'radar-bar';
        
        setTimeout(() => {
            barElement.style.width = `${value}%`;
            if (value >= 75) {
                barElement.classList.add('bar-success');
            } else if (value >= 40) {
                barElement.classList.add('bar-warning');
            } else {
                barElement.classList.add('bar-danger');
            }
        }, 100);
    }

    // --- 今日のレースを終了する機能 ---
    btnFinishDay.addEventListener('click', () => {
        if (history.length === 0 && currentRace.tickets.length === 0) {
            if (!confirm('まだ1件も記録がありません。このまま本日の競馬を終了しますか？')) {
                return;
            }
        } else {
            if (!confirm('今日の競馬を終了し、結果を確定しますか？終了すると追加の記録ができなくなります。')) {
                return;
            }
        }
        
        isFinished = true;
        saveData();
        lockAppForFinish();
    });

    // 終了ロック処理
    function lockAppForFinish() {
        isFinished = true;
        
        // フォームやボタンの非活性化
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
        
        // リスト再描画
        renderHistory();
        renderCurrentRace();

        // 最終評価の算出
        let totalInvestment = 0;
        let totalReturn = 0;
        history.forEach(item => {
            totalInvestment += item.investment;
            totalReturn += item.returnAmt;
        });

        const totalBalance = totalReturn - totalInvestment;
        const recoveryRate = totalInvestment > 0 ? Math.round((totalReturn / totalInvestment) * 100) : 0;
        const loss = totalInvestment - totalReturn;
        const lossRatio = budget > 0 ? (loss / budget) * 100 : 0;

        // 最終評価表示の更新
        const sign = totalBalance > 0 ? '+' : '';
        finishBalanceEl.textContent = `¥${sign}${totalBalance.toLocaleString()}`;
        finishBalanceEl.className = `val ${totalBalance > 0 ? 'plus' : totalBalance < 0 ? 'minus' : ''}`;
        finishRecoveryRateEl.textContent = `${recoveryRate}%`;
        finishRecoveryRateEl.className = `val ${recoveryRate >= 100 ? 'plus' : recoveryRate >= 50 ? 'warning' : 'minus'}`;
        finishRaceCountEl.textContent = `${history.length}回`;

        // 終了時AI総評のテキスト生成
        let finishAdvice = '';
        if (totalBalance > 0) {
            updateAiAvatarState('state-win', '🤩');
            finishAdvice = `素晴らしい！本日は最終的にプラス収支で見事に逃げ切りましたね！
回収率は驚異の ${recoveryRate}% です。勝っている段階で「レース終了」ボタンを自ら押して利益を確定させたその自制心は、プロの馬券師並みです。今日の勝ち分は競馬の場に置いていかず、即座に出金して美味しいものでも食べてください。この勝利体験を誇りに思い、次回も冷静に臨みましょう！`;
        } else if (totalBalance === 0) {
            updateAiAvatarState('', '😐');
            finishAdvice = `本日はトントン（プラマイゼロ）での決着となりました。
実質的に損失なく楽しめたのは良い結果です。熱くなって追加入金することなく、ここでしっかりと自制して終了できたのは素晴らしい判断力です。次は少しだけ回収率を高められるよう、今回の買い方を振り返ってみましょう。お疲れ様でした！`;
        } else {
            if (lossRatio >= 100) {
                updateAiAvatarState('state-danger', '👿');
                finishAdvice = `警告：本日は予算枠をすべて使い果たす結果（予算比 ${Math.round(lossRatio)}%の損失）となりました。
これは自制のルールが機能しなかったことを示しています。非常に悔しいとは思いますが、絶対に「他からお金を持ってきて取り返す」勝負はしないでください。競馬は長期的に楽しむ娯楽です。まずは財布を閉じて、冷静になる時間を作りましょう。この悔しさを次回の予算コントロールに必ず活かしてください。`;
            } else if (lossRatio >= 50) {
                updateAiAvatarState('state-danger', '🚨');
                finishAdvice = `本日は予算の半分以上（予算比 ${Math.round(lossRatio)}%の損失）を失う手痛い敗戦となりました。
しかし、予算のすべてを溶かしきる前に、ここで「レース終了」を選び撤退できたのは非常に大きな一歩です。残った資金は、次の戦いに備えるための大切な軍資金になります。今回はなぜ予想が噛み合わなかったのか、グラフを眺めながら冷静に分析してみましょう。反省こそが力になります。`;
            } else {
                updateAiAvatarState('state-warn', '🧐');
                finishAdvice = `本日のトータル収支は微減（予算比 ${Math.round(lossRatio)}%の損失）となりました。
損失を軽微な範囲に抑えて終了できたのは、非常に優れた自己コントロール力の証です。競馬において、大負けを防ぐスキルは勝つこと以上に重要です。今回の反省点（オッズの見極め、無駄なレース選びがなかったか等）を整理しておけば、次回はきっとプラスに持っていけるはずです。お疲れ様でした！`;
            }
        }

        // サマリーカードのフェードイン表示
        finishSummaryCard.classList.remove('hidden');
        inputCard.classList.add('hidden');

        // AI総評タイピング
        typeText(finishAiAdviceEl, finishAdvice, 15);
    }

    // --- 日付リセット処理 ---
    btnResetDay.addEventListener('click', () => {
        if (confirm('今日のデータをクリアし、予算設定から新しく始めますか？ (本日記録したすべての収支とグラフが消去されます)')) {
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
            
            // 活性化
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
            
            if (keibaChart) {
                keibaChart.destroy();
                keibaChart = null;
            }
            
            loadData();
        }
    });

    // --- Chart.js グラフ制御 ---
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
                    labels: labels,
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
                                font: {
                                    family: "'Inter', 'Noto Sans JP', sans-serif",
                                    size: 11
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += '¥' + context.parsed.y.toLocaleString();
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: '#9ca3af',
                                font: {
                                    family: "'Inter', 'Noto Sans JP', sans-serif"
                                }
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: '#9ca3af',
                                font: {
                                    family: "'Inter', 'Noto Sans JP', sans-serif"
                                },
                                callback: function(value) {
                                    return '¥' + value.toLocaleString();
                                }
                            },
                            min: Math.min(-budget * 1.2, ...chartData) - 1000,
                            max: Math.max(budget * 0.5, ...chartData) + 1000
                        }
                    }
                }
            });
        }
    }

    // アプリ起動データのロード
    loadData();
});
