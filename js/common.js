window.App = {
    CONFIG: {
        SIM_RUNS: 5000,
        NORMAL: {
            PULLS_FOR_TICKET: 40,
            TICKETS_FOR_EXCHANGE: 20,
            PULLS_PER_BATCH: 60,
            BM_PER_BATCH: 5000,
            BM_PER_SINGLE: 100
        },
        COLLAB: {
            PULLS_FOR_TICKET: 50,
            PULLS_PER_BATCH: 60,
            BM_PER_BATCH: 5000,
            BM_PER_SINGLE: 100,
            HIT_RATES: {
                CHAR_1: 0.50,
                CHAR_2: 0.50,
                CHAR_3_PLUS: 0.75
            }
        },
        TEMPLATES: {
            DEFAULT_TYPE: 3,
            2: { UR_RATE: 2.0, MULTIPLIER: 28, OTHER_COUNT: 83 },
            3: { UR_RATE: 2.0, MULTIPLIER: 28, OTHER_COUNT: 83 },
            4: { UR_RATE: 2.0, MULTIPLIER: 21, OTHER_COUNT: 83 },
            5: { UR_RATE: 2.0, MULTIPLIER: 21, OTHER_COUNT: 83 }
        },
        DEFAULTS: {
            CURRENT_TICKETS: 0,
            LUCK_PULLS: 60
        }
    },

    cardColors: [
        'assets/card_red.png', 
        'assets/card_blue.png', 
        'assets/card_green.png', 
        'assets/card_gray.png'
    ],
    numCards: 3,
    stateBm: [], // [{current: 0, target: 1, colorIdx: 0}, ...]
    stateLuck: [], // [{current: 0, colorIdx: 0}, ...]
    
    // Collab State
    collabState: [],
    collabCharsCount: 1,
    collabOrigTotal: 5,
    collabOrigWantedVars: [],

    renderGrid: function(containerId, stateArray, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        stateArray.forEach((state, i) => {
            const colorSrc = this.cardColors[state.colorIdx];
            const item = document.createElement('div');
            item.className = 'card-item';
            
            let val = type === 'target' ? state.target : state.current;
            
            item.innerHTML = `
                <img src="${colorSrc}" alt="Card" class="card-img" data-idx="${i}" data-view="${containerId}">
                <div class="stepper">
                    <button class="stepper-btn" data-idx="${i}" data-type="${type}" data-view="${containerId}" data-val="-1" ${val <= 0 ? 'disabled' : ''}>-</button>
                    <div class="stepper-value">${val}</div>
                    <button class="stepper-btn" data-idx="${i}" data-type="${type}" data-view="${containerId}" data-val="1" ${val >= 20 ? 'disabled' : ''}>+</button>
                </div>
            `;
            container.appendChild(item);
        });
    },

    renderAllGrids: function() {
        this.renderGrid('current-cards-bm', this.stateBm, 'current');
        this.renderGrid('target-cards-bm', this.stateBm, 'target');
        this.renderGrid('current-cards-luck', this.stateLuck, 'current');
    },

    initCardState: function(count) {
        this.stateBm = [];
        this.stateLuck = [];
        for(let i=0; i<count; i++) {
            this.stateBm.push({ current: 0, target: 1, colorIdx: i % 4 });
            this.stateLuck.push({ current: 0, colorIdx: i % 4 });
        }
        this.renderAllGrids();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    App.initCardState(App.numCards);

    // Global Event Delegation for Cards
    document.addEventListener('click', (e) => {
        // Stepper buttons
        if (e.target.classList.contains('stepper-btn')) {
            const idx = parseInt(e.target.dataset.idx);
            const type = e.target.dataset.type; // 'current' or 'target'
            const viewId = e.target.dataset.view; // 'current-cards-bm' etc.
            const val = parseInt(e.target.dataset.val);
            
            let targetState = viewId === 'current-cards-luck' ? App.stateLuck[idx] : App.stateBm[idx];

            if (type === 'current') {
                targetState.current = Math.max(0, Math.min(20, targetState.current + val));
            } else {
                targetState.target = Math.max(0, Math.min(20, targetState.target + val));
            }
            App.renderAllGrids();
        }

        // Card Image Color Picker
        if (e.target.classList.contains('card-img')) {
            const idx = parseInt(e.target.dataset.idx);
            const viewId = e.target.dataset.view;
            openColorPicker(idx, viewId);
        }
    });

    // Bulk Actions
    document.querySelectorAll('.bulk-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetType = e.target.closest('.bulk-actions') ? e.target.closest('.bulk-actions').dataset.target : null;
            if (!targetType) return;
            const val = parseInt(e.target.dataset.val);
            
            if (targetType === 'bm-current') {
                App.stateBm.forEach(s => s.current = val);
            } else if (targetType === 'bm-target') {
                App.stateBm.forEach(s => s.target = val);
            } else if (targetType === 'luck-current') {
                App.stateLuck.forEach(s => s.current = val);
            }
            App.renderAllGrids();
        });
    });

    // Template buttons
    document.querySelectorAll('.template-section .tmpl-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.template-section .tmpl-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const type = parseInt(e.target.dataset.type);
            App.numCards = type;
            App.initCardState(App.numCards);

            // Update inputs based on selection
            const multiplierInput = document.getElementById('target-card-multiplier');
            const otherCardInput = document.getElementById('other-card-count');
            const urRateInput = document.getElementById('total-ur-rate');
            
            const tmplData = App.CONFIG.TEMPLATES[type];
            if (tmplData) {
                if(otherCardInput) otherCardInput.value = tmplData.OTHER_COUNT;
                if(multiplierInput) multiplierInput.value = tmplData.MULTIPLIER;
                if(urRateInput) urRateInput.value = tmplData.UR_RATE;
            }
        });
    });

    // Menu logic
    const menuBtn = document.getElementById('menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    function toggleMenu() {
        if(menuBtn) menuBtn.classList.toggle('open');
        if(sideMenu) sideMenu.classList.toggle('open');
        if(menuOverlay) menuOverlay.classList.toggle('open');
    }
    if(menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if(menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

    // Routing Logic
    const menuLinks = document.querySelectorAll('.menu-link');
    const views = document.querySelectorAll('.view-section');
    const headerTitle = document.getElementById('header-title');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = e.target.dataset.view;
            if (!viewId) return;

            // Update active link
            menuLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');

            // Update views
            views.forEach(v => {
                v.classList.remove('active');
                v.classList.add('hidden');
            });
            const targetId = viewId === 'bm' ? 'view-bm-calc' : (viewId === 'luck' ? 'view-luck-checker' : 'view-collab-bm-calc');
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.remove('hidden');
                targetView.classList.add('active');
                
                // コラボ機能のリセット
                if (viewId === 'collab' && typeof App.resetCollabToStep1 === 'function') {
                    App.resetCollabToStep1();
                }

                // BM予測・ガチャ運のリセット
                if (viewId === 'bm' || viewId === 'luck') {
                    App.numCards = App.CONFIG.TEMPLATES.DEFAULT_TYPE;
                    App.initCardState(App.numCards);
                    
                    document.querySelectorAll('.tmpl-btn').forEach(btn => {
                        btn.classList.remove('active');
                        if (parseInt(btn.dataset.type) === App.numCards) btn.classList.add('active');
                    });

                    const currentTickets = document.getElementById('current-tickets');
                    if(currentTickets) currentTickets.value = App.CONFIG.DEFAULTS.CURRENT_TICKETS;
                    const luckPullsInput = document.getElementById('luck-pulls-input');
                    if(luckPullsInput) luckPullsInput.value = App.CONFIG.DEFAULTS.LUCK_PULLS;

                    // テンプレートデフォルト値の反映
                    const tmplData = App.CONFIG.TEMPLATES[App.numCards];
                    const totalUrRate = document.getElementById('total-ur-rate');
                    if(totalUrRate) totalUrRate.value = tmplData.UR_RATE;
                    const targetCardMultiplier = document.getElementById('target-card-multiplier');
                    if(targetCardMultiplier) targetCardMultiplier.value = tmplData.MULTIPLIER;
                    const otherCardCount = document.getElementById('other-card-count');
                    if(otherCardCount) otherCardCount.value = tmplData.OTHER_COUNT;
                }
                
                // Hide template section for collab view
                const templateSec = document.querySelector('.template-section');
                if (templateSec) {
                    if (viewId === 'collab') {
                        templateSec.style.display = 'none';
                    } else {
                        templateSec.style.display = 'block';
                    }
                }

                // Move settings section to be just above the primary button in the active view
                const settingsSec = document.querySelector('.settings-section');
                const primaryBtn = targetView.querySelector('.primary-btn');
                if (settingsSec && primaryBtn && viewId !== 'collab') {
                    targetView.insertBefore(settingsSec, primaryBtn);
                }
            }
            
            // Hide support banner when switching views
            const supportBanner = document.getElementById('support-banner');
            if (supportBanner) {
                supportBanner.classList.remove('show');
            }
            
            // Hide all result sections
            document.querySelectorAll('.result-section').forEach(sec => {
                sec.classList.remove('show');
                sec.classList.add('hidden');
                sec.style.display = '';
            });

            // Update Header
            if(headerTitle) {
                if (viewId === 'bm') {
                    headerTitle.innerText = '必要BM予測';
                } else if (viewId === 'luck') {
                    headerTitle.innerText = 'ガチャ運 偏差値判定';
                } else if (viewId === 'collab') {
                    headerTitle.innerText = 'コラボヒーロー＆コス獲得予測';
                }
            }

            toggleMenu(); // close side menu
        });
    });

    // Accordion Logic
    const advancedToggle = document.getElementById('advanced-settings-toggle');
    const advancedContent = document.getElementById('advanced-settings-content');
    if (advancedToggle && advancedContent) {
        advancedToggle.addEventListener('click', () => {
            advancedToggle.classList.toggle('open');
            advancedContent.classList.toggle('open');
        });
    }

    // Modal
    const formulaBtn = document.getElementById('menu-about');
    const formulaModal = document.getElementById('formula-modal');
    const closeModal = document.getElementById('close-modal-btn');

    if(formulaBtn) {
        formulaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(formulaModal) formulaModal.classList.add('show');
            toggleMenu(); // close side menu
        });
    }
    if(closeModal) {
        closeModal.addEventListener('click', () => {
            if(formulaModal) formulaModal.classList.remove('show');
        });
    }
    if(formulaModal) {
        formulaModal.addEventListener('click', (e) => {
            if (e.target === formulaModal) {
                formulaModal.classList.remove('show');
            }
        });
    }

    // Color Modal Logic
    let pickingIdx = -1;
    let pickingView = null;
    const colorModal = document.getElementById('color-modal');
    
    window.openColorPicker = function(idx, viewId) {
        pickingIdx = idx;
        pickingView = viewId;
        
        let currentColor = 0;
        if (viewId === 'current-cards-luck') {
            currentColor = App.stateLuck[idx].colorIdx;
        } else {
            currentColor = App.stateBm[idx].colorIdx;
        }
        
        document.querySelectorAll('.color-option').forEach(opt => {
            if (parseInt(opt.dataset.color) === currentColor) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        if(colorModal) colorModal.classList.add('show');
    };

    document.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            if (pickingIdx >= 0 && pickingView) {
                const colorIdx = parseInt(e.target.dataset.color);
                if (pickingView === 'current-cards-luck') {
                    App.stateLuck[pickingIdx].colorIdx = colorIdx;
                    App.renderAllGrids();
                } else {
                    App.stateBm[pickingIdx].colorIdx = colorIdx;
                    App.renderAllGrids();
                }
                if(colorModal) colorModal.classList.remove('show');
            }
        });
    });

    const closeColorModal = document.getElementById('close-color-modal');
    if(closeColorModal) {
        closeColorModal.addEventListener('click', () => {
            if(colorModal) colorModal.classList.remove('show');
        });
    }
    if(colorModal) {
        colorModal.addEventListener('click', (e) => {
            if (e.target === colorModal) {
                colorModal.classList.remove('show');
            }
        });
    }

    // Help Tooltip Logic
    const helpTooltip = document.getElementById('help-tooltip');
    let tooltipContent = null;
    if (helpTooltip) {
        tooltipContent = helpTooltip.querySelector('.help-tooltip-content');
    }

    window.App.helpTexts = {
        'template': '引きたいガチャの『ピックアップ対象カード』が何種類あるかを指定します。',
        'current': '現在所持している枚数を設定します。\n\n所持枚数の設定に加えて「詳細設定」から現在所持している『選べるURチケット』を含めて計算することも可能です。\n\n また、絵柄をタップするとカードの属性（色）を変更できます。',
        'target': '最終的に目指す枚数を設定します。\n\n現在の枚数との差分を計算し、必要なBMを予測します。',
        'pulls': 'これまで対象ガチャを回した合計回数を入力します。\n\n回数に応じて獲得できた『選べるURチケット』の枚数を自動で差し引いて判定します。',
        'collab_spec': 'コラボヒーローの数やコラボコスチュームの数を指定します。\nここでの設定によって、ガチャ1回あたりの各ヒーロー・衣装の排出確率（テンプレ）が自動的に決定されます。',
        'collab_target': 'シミュレーションのゴール（目標）を設定する項目です。\n\n一覧の中から狙っているヒーローや衣装のスイッチをタップして「狙う」状態（ON）にしてください。\nここでONにした対象をすべて引き当てるまで、裏側でガチャを回し続けて必要なBMを予測します。',
        'collab_char': 'このヒーローが排出された際の判定を指定します。\n\n「狙う」スイッチ：まだ獲得しておらず、出るまでガチャを回す対象にします。\n\n詳細設定内の「所持していますか？」スイッチ：\n初回確定枠（オリジナルコスチューム）を獲得済みである状態にします。これを「はい（ON）」にすると、以降このヒーローが排出された際はすべてのバリエーション衣装（オリジナル含む）から均等に抽選される仕様が再現されます。',
        'collab_orig': 'ガチャから「コラボコスチューム」が排出された場合の判定です。\n\nスイッチをタップして「狙う」状態（ON）にすると、指定した衣装をすべて獲得するまでシミュレーションを続行します。'
    };

    document.addEventListener('click', (e) => {
        const icon = e.target.closest('.help-icon');
        if (icon) {
            e.stopPropagation();
            if (!helpTooltip || !tooltipContent) return;
            const type = icon.dataset.help;
            if (window.App.helpTexts[type]) {
                tooltipContent.innerText = window.App.helpTexts[type];
                
                const rect = icon.getBoundingClientRect();
                tooltipContent.style.top = `${rect.bottom + 8}px`;
                
                const tooltipWidth = Math.min(280, window.innerWidth - 32);
                tooltipContent.style.width = `${tooltipWidth}px`;
                
                let leftPos = rect.left + rect.width / 2 - tooltipWidth / 2;
                if (leftPos < 16) leftPos = 16;
                if (leftPos + tooltipWidth > window.innerWidth - 16) {
                    leftPos = window.innerWidth - 16 - tooltipWidth;
                }
                tooltipContent.style.left = `${leftPos}px`;
                
                const pointerLeft = rect.left + rect.width / 2 - leftPos;
                tooltipContent.style.setProperty('--pointer-left', `${pointerLeft}px`);
                
                helpTooltip.classList.remove('hidden');
                setTimeout(() => helpTooltip.classList.add('show'), 10);
            }
        }
    });

    document.addEventListener('click', () => {
        if (helpTooltip && helpTooltip.classList.contains('show')) {
            helpTooltip.classList.remove('show');
            setTimeout(() => helpTooltip.classList.add('hidden'), 200);
        }
    });

    // Support Banner global utility
    let bannerClosed = false;
    let bannerInterval = null;
    window.triggerSupportBanner = function() {
        if (bannerClosed) return;
        const supportBanner = document.getElementById('support-banner');
        if (supportBanner && !supportBanner.classList.contains('show')) {
            const msg = document.getElementById('banner-msg');
            const code = document.getElementById('banner-code');
            if (msg && code) {
                msg.classList.remove('slide-in', 'slide-out');
                code.classList.remove('slide-in', 'slide-out');
            }
            supportBanner.classList.add('show');
            
            if (bannerInterval) clearInterval(bannerInterval);
            
            let showingMsg = true;
            bannerInterval = setInterval(() => {
                if (!supportBanner.classList.contains('show')) {
                    clearInterval(bannerInterval);
                    return;
                }
                showingMsg = !showingMsg;
                if (showingMsg && msg && code) {
                    msg.classList.remove('slide-out');
                    msg.classList.add('slide-in');
                    code.classList.remove('slide-in');
                    code.classList.add('slide-out');
                } else if (!showingMsg && msg && code) {
                    msg.classList.remove('slide-in');
                    msg.classList.add('slide-out');
                    code.classList.remove('slide-out');
                    code.classList.add('slide-in');
                }
            }, 3000); // 3秒ごとに切り替え
        }
    };
    
    // Copy functionality for banner
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast');
    if(copyBtn) {
        copyBtn.addEventListener('click', () => {
            const code = 'C-VtNQ';
            navigator.clipboard.writeText(code).then(() => {
                if(toast) {
                    toast.classList.remove('hidden');
                    setTimeout(() => toast.classList.add('show'), 10);
                    setTimeout(() => {
                        toast.classList.remove('show');
                        setTimeout(() => toast.classList.add('hidden'), 300);
                    }, 2000);
                }
                const supportBanner = document.getElementById('support-banner');
                if (supportBanner) {
                    supportBanner.classList.remove('show');
                    bannerClosed = true; // 一度閉じたらリロードするまで表示しない
                    if (bannerInterval) clearInterval(bannerInterval);
                }
            });
        });
    }
});
