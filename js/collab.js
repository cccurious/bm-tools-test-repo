document.addEventListener('DOMContentLoaded', () => {
    const collabStep1 = document.getElementById('collab-step-1');
    const collabStep2 = document.getElementById('collab-step-2');
    const collabNextBtn = document.getElementById('collab-next-btn');
    const collabBackBtn = document.getElementById('collab-back-btn');
    const collabStep2Header = document.getElementById('collab-step2-header');
    
    const collabTmplBtns = document.querySelectorAll('.collab-tmpl-btn');
    const origTotalMinus = document.getElementById('orig-total-minus');
    const origTotalPlus = document.getElementById('orig-total-plus');
    const origTotalVal = document.getElementById('orig-total-val');

    function initCollabState() {
        const oldState = [...App.collabState];
        App.collabState = [];
        for (let i = 0; i < App.collabCharsCount; i++) {
            if (oldState[i]) {
                App.collabState.push(oldState[i]);
            } else {
                App.collabState.push({
                    defaultState: 'none', 
                    wantedVars: [], 
                    varCount: 1,
                    name: `コラボヒーロー${String.fromCharCode(65 + i)}`,
                    isAccordionOpen: false
                });
            }
        }
        renderCollabCards();
    }
    function renderCollabCards() {
        const collabCardsContainer = document.getElementById('collab-cards-container');
        if (!collabCardsContainer) return;
        collabCardsContainer.innerHTML = '';
        let collabHitRate = 0.0;
        if (App.collabCharsCount === 0) {
            collabHitRate = 0.0;
        } else if (App.collabOrigTotal === 0) {
            collabHitRate = 1.0;
        } else if (App.collabCharsCount === 1) {
            collabHitRate = 0.50;
        } else if (App.collabCharsCount === 2) {
            collabHitRate = 0.50;
        } else {
            collabHitRate = 0.75; // 3体以上の場合はキャラ枠75%、オリコス枠25%
        }
        
        let charRate = App.collabCharsCount > 0 ? (collabHitRate / App.collabCharsCount) * 100 : 0;
        const rateHtml = `<span style="color: #a0aec0; font-size: 0.8rem; margin-left: 8px; font-weight: normal;">(${charRate.toFixed(1)}%)</span>`;

        let origHitRate = App.collabOrigTotal > 0 ? (1.0 - collabHitRate) : 0;
        let origRate = App.collabOrigTotal > 0 ? (origHitRate / App.collabOrigTotal) * 100 : 0;
        const origRateHtml = `<span style="color: #a0aec0; font-size: 0.8rem; margin-left: 8px; font-weight: normal;">(各${origRate.toFixed(1)}%)</span>`;

        App.collabState.forEach((char, idx) => {
            const card = document.createElement('div');
            card.className = 'collab-card';
            card.innerHTML = `
                <div class="collab-card-header" style="justify-content: center; margin-bottom: 12px;">
                    <h3 class="section-title" style="margin: 0; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        コラボヒーロー ${String.fromCharCode(65 + idx)} ${rateHtml}
                        <img src="assets/help.svg" class="help-icon" data-help="collab_char" alt="help" style="width: 18px; height: 18px; cursor: pointer;">
                    </h3>
                </div>
                <div class="collab-card-body" style="padding: 0;">
                    <div class="collab-list-container">
                        <div class="collab-list-item">
                            <span class="collab-list-label" style="${char.defaultState === 'owned' ? 'color: #a0aec0;' : ''}">オリジナルコスチューム</span>
                            <div class="collab-list-actions" style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 0.8rem; font-weight: bold; white-space: nowrap; flex-shrink: 0; color: ${char.defaultState === 'wanted' ? 'var(--primary-color)' : 'var(--subdued-text)'}; ${char.defaultState === 'owned' ? 'color: #cbd5e0;' : ''}">${char.defaultState === 'wanted' ? '狙う' : '狙わない'}</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" class="collab-toggle wanted" ${char.defaultState === 'wanted' ? 'checked' : ''} ${char.defaultState === 'owned' ? 'disabled' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <button class="collab-accordion-toggle ${char.isAccordionOpen ? 'open' : ''}">
                        ${char.isAccordionOpen ? '▲ 別コスチューム設定を閉じる' : '▼ 別コスチューム設定を開く'}
                    </button>
                    
                    <div class="collab-accordion-content-wrapper ${char.isAccordionOpen ? 'open' : ''}">
                        <div class="collab-accordion-inner">
                            <div class="collab-accordion-content" style="padding: 0;">
                                <div class="collab-var-row" style="padding: 12px 12px 20px; margin: 0 0 12px 0; border-bottom: 2px dotted var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 0.85rem; color: var(--text-color);">オリジナルコスチュームを所持していますか？</span>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 0.8rem; font-weight: bold; white-space: nowrap; flex-shrink: 0; color: ${char.defaultState === 'owned' ? 'var(--primary-color)' : 'var(--subdued-text)'};">${char.defaultState === 'owned' ? 'はい' : 'いいえ'}</span>
                                        <label class="toggle-switch">
                                            <input type="checkbox" class="collab-toggle owned" ${char.defaultState === 'owned' ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div class="collab-var-row" style="padding: 12px; margin: 0; border-bottom: 1px solid var(--border-color);">
                                    <span>コスチュームの総数（オリジナル含む）</span>
                                    <div class="stepper">
                                        <button class="stepper-btn var-minus" ${char.varCount <= 1 ? 'disabled' : ''}>-</button>
                                        <div class="stepper-value">${char.varCount}</div>
                                        <button class="stepper-btn var-plus" ${char.varCount >= 10 ? 'disabled' : ''}>+</button>
                                    </div>
                                </div>
                                <div class="collab-list-container" id="collab-vars-${idx}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            collabCardsContainer.appendChild(card);
            
            const varContainer = card.querySelector(`#collab-vars-${idx}`);
            for (let v = 1; v < char.varCount; v++) {
                const isWanted = char.wantedVars.includes(v);
                const vItem = document.createElement('div');
                vItem.className = 'collab-list-item';
                vItem.innerHTML = `
                    <span class="collab-list-label">バリエーション ${v}</span>
                    <div class="collab-list-actions" style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.8rem; font-weight: bold; white-space: nowrap; flex-shrink: 0; color: ${isWanted ? 'var(--primary-color)' : 'var(--subdued-text)'};">${isWanted ? '狙う' : '狙わない'}</span>
                        <label class="toggle-switch">
                            <input type="checkbox" class="collab-check-toggle" data-v="${v}" ${isWanted ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                `;
                varContainer.appendChild(vItem);
                
                const btn = vItem.querySelector('.collab-check-toggle');
                btn.addEventListener('change', () => {
                    const vIdx = char.wantedVars.indexOf(v);
                    if (vIdx > -1) {
                        char.wantedVars.splice(vIdx, 1);
                    } else {
                        char.wantedVars.push(v);
                    }
                    renderCollabCards();
                });
            }

            const toggle = card.querySelector('.collab-accordion-toggle');
            const wrapper = card.querySelector('.collab-accordion-content-wrapper');
            toggle.addEventListener('click', () => {
                char.isAccordionOpen = !char.isAccordionOpen;
                toggle.classList.toggle('open');
                wrapper.classList.toggle('open');
                toggle.innerText = char.isAccordionOpen ? '▲ 別コスチューム設定を閉じる' : '▼ 別コスチューム設定を開く';
            });

            const btnWanted = card.querySelector('.collab-toggle.wanted');
            const btnOwned = card.querySelector('.collab-toggle.owned');
            if (btnWanted) {
                btnWanted.addEventListener('change', () => {
                    char.defaultState = char.defaultState === 'wanted' ? 'none' : 'wanted';
                    renderCollabCards();
                });
            }
            if (btnOwned) {
                btnOwned.addEventListener('change', () => {
                    char.defaultState = char.defaultState === 'owned' ? 'none' : 'owned';
                    renderCollabCards();
                });
            }

                    // 自由入力テキスト廃止のため削除

            card.querySelector('.var-minus').addEventListener('click', () => {
                if (char.varCount > 1) {
                    char.varCount--;
                    char.wantedVars = char.wantedVars.filter(v => v < char.varCount);
                    renderCollabCards();
                }
            });
            card.querySelector('.var-plus').addEventListener('click', () => {
                if (char.varCount < 10) {
                    char.varCount++;
                    renderCollabCards();
                }
            });
            
            // アイコンクリック（カラーピッカー）廃止のため削除
        });
        
        if (App.collabOrigTotal > 0 || App.collabCharsCount === 0) {
            const origCard = document.createElement('div');
            origCard.className = 'collab-card';
            origCard.style.marginTop = '20px';
            origCard.innerHTML = `
                <div class="collab-card-header" style="justify-content: center; margin-bottom: 12px;">
                    <h3 class="section-title" style="margin: 0; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        コラボコスチューム ${origRateHtml}
                        <img src="assets/help.svg" class="help-icon" data-help="collab_orig" alt="help" style="width: 18px; height: 18px; cursor: pointer;">
                    </h3>
                </div>
                <div class="orig-card-body" style="padding: 0;">
                    <div class="collab-list-container" id="orig-vars-container"></div>
                </div>
            `;
            collabCardsContainer.appendChild(origCard);
            
            const origVarContainer = origCard.querySelector('#orig-vars-container');
            for (let v = 1; v <= App.collabOrigTotal; v++) {
                const isWanted = App.collabOrigWantedVars.includes(v);
                const vItem = document.createElement('div');
                vItem.className = 'collab-list-item';
                vItem.innerHTML = `
                    <span class="collab-list-label">コラボコス ${v}</span>
                    <div class="collab-list-actions" style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.8rem; font-weight: bold; white-space: nowrap; flex-shrink: 0; color: ${isWanted ? 'var(--primary-color)' : 'var(--subdued-text)'};">${isWanted ? '狙う' : '狙わない'}</span>
                        <label class="toggle-switch">
                            <input type="checkbox" class="collab-orig-toggle" data-v="${v}" ${isWanted ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                `;
                origVarContainer.appendChild(vItem);
                
                const btn = vItem.querySelector('.collab-orig-toggle');
                btn.addEventListener('change', () => {
                    const vIdx = App.collabOrigWantedVars.indexOf(v);
                    if (vIdx > -1) {
                        App.collabOrigWantedVars.splice(vIdx, 1);
                    } else {
                        App.collabOrigWantedVars.push(v);
                    }
                    renderCollabCards();
                });
            }
        }
    }

    if(collabTmplBtns.length > 0) {
        collabTmplBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                collabTmplBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                App.collabCharsCount = parseInt(e.target.dataset.count);
                initCollabState();
            });
        });
    }

    function updateOrigTotalUI() {
        if(origTotalMinus) origTotalMinus.disabled = App.collabOrigTotal <= 0;
        if(origTotalPlus) origTotalPlus.disabled = App.collabOrigTotal >= 10;
    }

    if(origTotalMinus && origTotalPlus) {
        origTotalMinus.addEventListener('click', () => {
            if (App.collabOrigTotal > 0) { 
                App.collabOrigTotal--; 
                App.collabOrigWantedVars = App.collabOrigWantedVars.filter(v => v <= App.collabOrigTotal);
                if(origTotalVal) origTotalVal.innerText = App.collabOrigTotal;
                updateOrigTotalUI();
                renderCollabCards();
            }
        });
        origTotalPlus.addEventListener('click', () => {
            if (App.collabOrigTotal < 10) { 
                App.collabOrigTotal++; 
                if(origTotalVal) origTotalVal.innerText = App.collabOrigTotal;
                updateOrigTotalUI();
                renderCollabCards();
            }
        });
        updateOrigTotalUI();
    }

    if (collabNextBtn) {
        collabNextBtn.addEventListener('click', () => {
            if(collabStep1) collabStep1.classList.add('hidden');
            if(collabStep2) collabStep2.classList.remove('hidden');
            if(collabStep2Header) collabStep2Header.innerText = `ヒーロー ${App.collabCharsCount}人 / コラボコス ${App.collabOrigTotal}種`;
        });
    }

    if (collabBackBtn) {
        collabBackBtn.addEventListener('click', () => {
            collabStep2.classList.add('hidden');
            collabStep1.classList.remove('hidden');
            if(collabResultSec) {
                collabResultSec.classList.remove('show');
                collabResultSec.classList.add('hidden');
                collabResultSec.style.display = '';
            }
            
            // 選択状況とアコーディオンをリセット
            App.collabOrigWantedVars = [];
            App.collabState.forEach(c => {
                c.defaultState = 'none';
                c.wantedVars = [];
                c.isAccordionOpen = false;
            });
            renderCollabCards();
        });
    }

    // Initialize Collab state
    initCollabState();

    function simulateCollabPulls(runs, totalOrig, origWantedVars, collabSettings) {
        let totalPullsNeeded = [];
        for (let r = 0; r < runs; r++) {
            let pulls = 0;
            let origAcquired = new Set();
            let collabOwned = collabSettings.map(c => c.defaultState === 'owned');
            let collabVarAcquired = collabSettings.map(c => new Set());
            
            while (true) {
                let win = true;
                for (let wv of origWantedVars) {
                    if (!origAcquired.has(wv - 1)) {
                        win = false; break;
                    }
                }
                
                if (!win) {
                    // まだ条件を満たしていない場合はスルーして下のキャラ判定へ
                } else {
                    for (let i = 0; i < collabSettings.length; i++) {
                    if (collabSettings[i].defaultState === 'wanted' && !collabOwned[i]) {
                        win = false; break;
                    }
                    for (let wv of collabSettings[i].wantedVars) {
                        if (!collabVarAcquired[i].has(wv)) {
                            win = false; break;
                        }
                    }
                }
            }
                
                if (win) break;
                
                pulls += 50; 
                let collabCount = collabSettings.length;
                
                let collabHitRate = 0.0;
                if (collabCount === 0) {
                    collabHitRate = 0.0;
                } else if (totalOrig === 0) {
                    collabHitRate = 1.0;
                } else if (collabCount === 1) {
                    collabHitRate = 0.50;
                } else if (collabCount === 2) {
                    collabHitRate = 0.50;
                } else {
                    collabHitRate = 0.75;
                }
                
                if (Math.random() < collabHitRate) {
                    let idx = Math.floor(Math.random() * collabCount);
                    handleCollabHit(idx);
                } else {
                    let item = Math.floor(Math.random() * totalOrig);
                    origAcquired.add(item);
                }
            }
            
            function handleCollabHit(idx) {
                if (!collabOwned[idx]) {
                    collabOwned[idx] = true;
                } else {
                    let varHit = Math.floor(Math.random() * collabSettings[idx].varCount);
                    if (varHit > 0) {
                        collabVarAcquired[idx].add(varHit);
                    }
                }
            }
            
            totalPullsNeeded.push(pulls);
        }
        
        totalPullsNeeded.sort((a,b) => a-b);
        return totalPullsNeeded[Math.floor(runs/2)];
    }

    const collabCalcBtn = document.getElementById('collab-calc-btn');
    const collabResultSec = document.getElementById('collab-result-section');
    const collabResultBm = document.getElementById('collab-result-bm');
    const collabResultPulls = document.getElementById('collab-result-pulls');
    const resetCollabBtn = document.getElementById('reset-collab-btn');

    if(collabCalcBtn) {
        collabCalcBtn.addEventListener('click', () => {
            let hasTarget = false;
            if (App.collabOrigWantedVars.length > 0) hasTarget = true;
            App.collabState.forEach(c => {
                if (c.defaultState === 'wanted') hasTarget = true;
                if (c.wantedVars.length > 0) hasTarget = true;
            });

            if (!hasTarget) {
                alert('欲しい衣装が1つも選択されていません。\n「欲しい！」ボタンを押すか、衣装アイコンをタップして目標を設定してください。');
                return;
            }

            collabCalcBtn.innerHTML = '<span class="spinner"></span>計算中...';
            collabCalcBtn.disabled = true;

            setTimeout(() => {
                try {
                    const resultPulls = simulateCollabPulls(5000, App.collabOrigTotal, App.collabOrigWantedVars, App.collabState);
                    
                    if (resultPulls !== undefined && !isNaN(resultPulls)) {
                        let batches = Math.floor(resultPulls / 60);
                        let singles = resultPulls % 60;
                        let singlesCost = singles * 100;
                        if (singlesCost >= 5000) { singlesCost = 5000; }
                        const totalBM = batches * 5000 + singlesCost;
                        
                        const earnedTickets = Math.floor(resultPulls / 50);

                        collabResultBm.innerText = totalBM.toLocaleString() + ' BM';
                        collabResultPulls.innerText = `合計 ${resultPulls.toLocaleString()}連（コラボチケット ${earnedTickets.toLocaleString()}枚分）`;
                        
                        collabResultSec.classList.remove('hidden');
                        collabResultSec.style.display = ''; 
                        setTimeout(() => collabResultSec.classList.add('show'), 10);
                        setTimeout(() => { collabResultSec.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 100);
                        
                        if (window.triggerSupportBanner) {
                            window.triggerSupportBanner();
                        }
                    } else {
                        alert("予測に失敗しました。条件を見直してください。");
                    }
                } catch(e) {
                    alert("シミュレーション中にエラーが発生しました: " + e.message);
                } finally {
                    collabCalcBtn.innerHTML = 'いくら必要か予測する！';
                    collabCalcBtn.disabled = false;
                }
            }, 100);
        });
    }
    // Bulk Actions (全て欲しい / 全て解除)
    document.querySelectorAll('.collab-bulk-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'all-wanted') {
                App.collabState.forEach(char => {
                    char.defaultState = 'wanted';
                    char.wantedVars = [];
                    for (let v = 1; v < char.varCount; v++) {
                        char.wantedVars.push(v);
                    }
                });
                App.collabOrigWantedVars = [];
                for (let v = 1; v <= App.collabOrigTotal; v++) {
                    App.collabOrigWantedVars.push(v);
                }
            } else if (action === 'all-reset') {
                App.collabState.forEach(char => {
                    char.defaultState = 'none';
                    char.wantedVars = [];
                });
                App.collabOrigWantedVars = [];
            }
            renderCollabCards();
        });
    });

    if(resetCollabBtn) {
        resetCollabBtn.addEventListener('click', () => {
            if(collabResultSec) {
                collabResultSec.classList.remove('show');
                setTimeout(() => {
                    collabResultSec.classList.add('hidden');
                    collabResultSec.style.display = '';
                }, 300);
            }
            const collabStep2Header = document.getElementById('collab-step2-header');
            if(collabStep2Header) {
                collabStep2Header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

});
