document.addEventListener('DOMContentLoaded', () => {
    // Seeded Random Generator (Mulberry32)
    function mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    function simulatePulls(P_target, typesCount, needs, initialTickets, probPercent) {
        const runs = App.CONFIG.SIM_RUNS;
        let results = new Int32Array(runs);
        
        // Dynamic seed so results fluctuate per calculation
        const seed = Math.floor(Math.random() * 0xFFFFFFFF);
        const prng = mulberry32(seed);
        
        for(let i = 0; i < runs; i++) {
            let pulls = 0;
            let tickets = initialTickets;
            let currentNeeds = [...needs];
            
            while(true) {
                let totalDeficit = currentNeeds.reduce((a, b) => a + b, 0);
                let availableExchanges = Math.floor(tickets / App.CONFIG.NORMAL.TICKETS_FOR_EXCHANGE);
                
                if (totalDeficit <= availableExchanges) {
                    break;
                }
                
                pulls++;
                
                if (prng() < (P_target * typesCount)) {
                    let typeIdx = Math.floor(prng() * typesCount);
                    if (currentNeeds[typeIdx] > 0) {
                        currentNeeds[typeIdx]--;
                    }
                }
                
                if (pulls % App.CONFIG.NORMAL.PULLS_FOR_TICKET === 0) tickets++;
            }
            results[i] = pulls;
        }
        
        results.sort();
        let idx = Math.floor(runs * (probPercent / 100));
        if (idx >= runs) idx = runs - 1;
        return results[idx];
    }

    const calcBtn = document.getElementById('calc-btn');
    const resultSec = document.getElementById('result-section');

    function showResult(bm, pulls, earnedTickets) {
        document.getElementById('result-bm').innerText = `${bm.toLocaleString()} BM`;
        document.getElementById('result-pulls').innerText = `合計 ${pulls.toLocaleString()}連`;
        
        resultSec.classList.remove('hidden');
        setTimeout(() => resultSec.classList.add('show'), 10);
        setTimeout(() => { resultSec.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 100);

        if(window.triggerSupportBanner) window.triggerSupportBanner();
    }

    if(calcBtn) {
        calcBtn.addEventListener('click', () => {
            const probPercent = 50; // Central value logic
            const initialTickets = parseInt(document.getElementById('current-tickets').value) || 0;
            const multiplier = parseFloat(document.getElementById('target-card-multiplier').value);
            const otherCards = parseFloat(document.getElementById('other-card-count').value);
            const urRate = parseFloat(document.getElementById('total-ur-rate').value) / 100;

            const pSpecific = (1 * multiplier) / ((App.numCards * multiplier) + otherCards) * urRate;

            let needs = App.stateBm.map(s => Math.max(0, s.target - s.current));
            let totalNeeds = needs.reduce((a, b) => a + b, 0);

            if (totalNeeds === 0) {
                showResult(0, 0, 0);
                return;
            }

            // Show loading state
            const originalText = calcBtn.innerHTML;
            calcBtn.disabled = true;
            calcBtn.innerHTML = '<span class="spinner"></span>計算中...';
            calcBtn.style.opacity = '0.8';
            calcBtn.style.cursor = 'not-allowed';

            // Yield to browser rendering before heavy calculation
            setTimeout(() => {
                const pulls = simulatePulls(pSpecific, App.numCards, needs, initialTickets, probPercent);
                const earnedTickets = Math.floor(pulls / App.CONFIG.NORMAL.PULLS_FOR_TICKET);
                
                const batchPulls = App.CONFIG.NORMAL.PULLS_PER_BATCH;
                const batchCost = App.CONFIG.NORMAL.BM_PER_BATCH;
                const singleCost = App.CONFIG.NORMAL.BM_PER_SINGLE;
                
                let batches = Math.floor(pulls / batchPulls);
                let singles = pulls % batchPulls;
                let singlesTotalCost = singles * singleCost;
                if (singlesTotalCost >= batchCost) { singlesTotalCost = batchCost; }
                const totalBM = batches * batchCost + singlesTotalCost;

                showResult(totalBM, pulls, earnedTickets);

                // Restore button
                calcBtn.disabled = false;
                calcBtn.innerHTML = originalText;
                calcBtn.style.opacity = '1';
                calcBtn.style.cursor = 'pointer';
            }, 50);
        });
    }

    const resetBmBtn = document.getElementById('reset-bm-btn');
    if (resetBmBtn) {
        resetBmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo(0, 0);
            resultSec.classList.remove('show');
            setTimeout(() => resultSec.classList.add('hidden'), 300);
        });
    }
});
