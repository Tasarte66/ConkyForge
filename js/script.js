window.onerror = function(msg, url, line) { console.error("Error detected: " + msg); };

const canvas = document.getElementById('conky-canvas');
const wrapper = document.getElementById('canvas-wrapper');
let blockCounter = 0; let zIndexCounter = 10; let isPreviewMode = false;
const GRID_SIZE = 20;

const colorInputs = {
    text: document.getElementById('color-text'),
    accent: document.getElementById('color-accent'),
    cpu: document.getElementById('color-cpu'),
    ram: document.getElementById('color-ram'),
    disk: document.getElementById('color-disk'),
    temp: document.getElementById('color-temp')
};

function updateColors() {
    if(colorInputs.text) document.documentElement.style.setProperty('--col-text', colorInputs.text.value);
    if(colorInputs.accent) document.documentElement.style.setProperty('--col-accent', colorInputs.accent.value);
    if(colorInputs.cpu) document.documentElement.style.setProperty('--col-cpu', colorInputs.cpu.value);
    if(colorInputs.ram) document.documentElement.style.setProperty('--col-ram', colorInputs.ram.value);
    if(colorInputs.disk) document.documentElement.style.setProperty('--col-disk', colorInputs.disk.value);
    if(colorInputs.temp) document.documentElement.style.setProperty('--col-temp', colorInputs.temp.value);
}

Object.values(colorInputs).forEach(input => {
    if(input) input.addEventListener('input', updateColors);
});

function hexToRgbRatio(hex) {
    if (!hex) return "1, 1, 1";
    hex = hex.trim();
    if (hex.length === 4) { hex = '#' + hex[1]+hex[1] + hex[2]+hex[2] + hex[3]+hex[3]; }
    if (!hex.startsWith('#') || hex.length !== 7) return "1, 1, 1";
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    if(isNaN(r) || isNaN(g) || isNaN(b)) return "1, 1, 1";
    return r.toFixed(3) + ", " + g.toFixed(3) + ", " + b.toFixed(3);
}

const fontSelect = document.getElementById('config-font');
const fontCustom = document.getElementById('config-font-custom');

function updateWebFont() {
    if (!fontSelect) return;
    let fontName = fontSelect.value === 'CUSTOM' ? (fontCustom ? fontCustom.value.trim() : '') : fontSelect.value;
    if (fontName && canvas) {
        canvas.style.fontFamily = '"' + fontName + '", "DejaVu Sans", sans-serif';
    }
}

if(fontSelect) {
    fontSelect.addEventListener('change', function(e) {
        if (e.target.value === 'CUSTOM' && fontCustom) {
            fontCustom.style.display = 'block';
            fontSelect.style.width = '50%';
        } else if (fontCustom) {
            fontCustom.style.display = 'none';
            fontSelect.style.width = '100%';
        }
        updateWebFont();
    });
}
if(fontCustom) fontCustom.addEventListener('input', updateWebFont);

const cwInput = document.getElementById('config-width');
if(cwInput) cwInput.addEventListener('input', function(e) { if(canvas) canvas.style.width = e.target.value + 'px'; });

const chInput = document.getElementById('config-height');
if(chInput) chInput.addEventListener('input', function(e) { if(canvas) canvas.style.height = e.target.value + 'px'; });

const scaleInput = document.getElementById('config-scale');
if(scaleInput) {
    scaleInput.addEventListener('input', function(e) {
        const scaleVal = parseFloat(e.target.value) || 1.0;
        if(canvas) canvas.style.transform = 'scale(' + scaleVal + ')';
        if(wrapper && canvas) {
            wrapper.style.width = (parseFloat(canvas.style.width) * scaleVal) + 'px';
            wrapper.style.height = (parseFloat(canvas.style.height) * scaleVal) + 'px';
        }
    });
}

const resizeObserver = new ResizeObserver(function(entries) {
    for (let i = 0; i < entries.length; i++) {
        const badge = entries[i].target.querySelector('.size-badge');
        if (badge) {
            badge.textContent = Math.round(entries[i].contentRect.width) + "x" + Math.round(entries[i].contentRect.height) + "px";
        }
    }
});

function createBlock(title, type, extraData) {
    extraData = extraData || '';
    const block = document.createElement('div');
    block.className = 'conky-block';
    block.id = 'block-' + (blockCounter++);
    block.dataset.type = type;
    block.dataset.extra = extraData;
    block.dataset.title = title;
    block.dataset.offx = 0;
    block.dataset.offy = 0;

    const offset = Math.round(((blockCounter * 20) % 100) / GRID_SIZE) * GRID_SIZE;
    block.style.left = (20 + offset) + 'px';
    block.style.top = (20 + offset) + 'px';
    block.style.zIndex = zIndexCounter;

    let visualContent = '';
    let showTitle = true;
    let needsBadge = false;

    const noTitleTypes = ['line', 'line_diag', 'geometry', 'neon', 'ring_cpu', 'ring_ram', 'ring_gpu_dual', 'disk', 'disk_lua', 'cpu', 'ram', 'graph_net', 'eq_cpu', 'eq_horiz', 'eq_circ', 'eq_concent', 'eq_circ_open', 'eq_concent_open', 'image', 'anim_png', 'media', 'audacious', 'clock', 'weather', 'weather_pro', 'text_vert', 'text_horiz', 'spiral_rev', 'spiral_dna', 'graph_fluid', 'analog_clock', 'ticker'];
    const badgeTypes = ['line', 'line_diag', 'geometry', 'neon', 'image', 'anim_png', 'text_vert', 'text_horiz', 'graph_net', 'disk', 'disk_lua', 'cpu', 'ram', 'media', 'audacious', 'clock', 'weather', 'weather_pro', 'spiral_rev', 'spiral_dna', 'graph_fluid', 'analog_clock', 'eq_cpu', 'eq_horiz', 'eq_circ', 'eq_concent', 'eq_circ_open', 'eq_concent_open', 'ticker'];

    if (noTitleTypes.indexOf(type) !== -1) showTitle = false;
    if (badgeTypes.indexOf(type) !== -1) needsBadge = true;

    if (type === 'line') {
        let parts = extraData.split(',');
        let dir = parts[0] ? parts[0].trim().toLowerCase() : 'h';
        let thick = parseInt(parts[1]) || 2;
        let customCol = (parts[2] && parts[2].trim().startsWith('#')) ? parts[2].trim() : 'var(--col-accent)';

        block.style.backgroundColor = "transparent"; block.style.border = "1px dashed " + customCol;
        if (dir === 'v') {
            block.style.height = "200px"; block.style.width = "40px";
            visualContent = '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center;"><div style="width:' + thick + 'px; height:100%; background-color:' + customCol + '; opacity:0.8; border-radius:2px;"></div></div>';
        } else {
            block.style.height = "40px"; block.style.width = "200px";
            visualContent = '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center;"><div style="width:100%; height:' + thick + 'px; background-color:' + customCol + '; opacity:0.8; border-radius:2px;"></div></div>';
        }
    }
    else if (type === 'line_diag') {
        let parts = extraData.split(',');
        let dir = parts[0] === "2" ? "up" : "down";
        let thick = parseInt(parts[1]) || 2;
        let customCol = (parts[2] && parts[2].trim().startsWith('#')) ? parts[2].trim() : 'var(--col-accent)';

        block.style.height = "100px"; block.style.width = "100px";
        block.style.backgroundColor = "transparent"; block.style.border = "1px dashed " + customCol;
        let svgLine = dir === "up"
        ? '<line x1="0" y1="100%" x2="100%" y2="0" stroke="' + customCol + '" stroke-width="' + thick + '" opacity="0.8"/>'
        : '<line x1="0" y1="0" x2="100%" y2="100%" stroke="' + customCol + '" stroke-width="' + thick + '" opacity="0.8"/>';
        visualContent = '<svg width="100%" height="100%" style="display:block;">' + svgLine + '</svg>';
    }
    else if (type === 'geometry') {
        let parts = extraData.split(',');
        let geoType = parts[0] || '1';
        let thick = parseInt(parts[1]) || 2;
        let customCol = (parts[2] && parts[2].trim().startsWith('#')) ? parts[2].trim() : 'var(--col-accent)';

        block.style.height = "100px"; block.style.width = "100px";
        block.style.backgroundColor = "transparent"; block.style.border = "1px dashed " + customCol;

        let r_svg = 50 - (thick/2);
        let svgPath = "";

        if (geoType === '1') svgPath = '<circle cx="50" cy="50" r="' + r_svg + '" fill="none" stroke="' + customCol + '" stroke-width="' + thick + '" opacity="0.8"/>';
        else if (geoType === '2') svgPath = '<path d="M ' + (thick/2) + ' 50 A ' + r_svg + ' ' + r_svg + ' 0 0 1 ' + (100 - thick/2) + ' 50" fill="none" stroke="' + customCol + '" stroke-width="' + thick + '" opacity="0.8"/>';
        else if (geoType === '3') svgPath = '<path d="M ' + (thick/2) + ' 50 A ' + r_svg + ' ' + r_svg + ' 0 0 0 ' + (100 - thick/2) + ' 50" fill="none" stroke="' + customCol + '" stroke-width="' + thick + '" opacity="0.8"/>';
        else if (geoType === '4') svgPath = '<path d="M 50 ' + (thick/2) + ' A ' + r_svg + ' ' + r_svg + ' 0 0 0 50 ' + (100 - thick/2) + '" fill="none" stroke="' + customCol + '" stroke-width="' + thick + '" opacity="0.8"/>';
        else if (geoType === '5') svgPath = '<path d="M 50 ' + (thick/2) + ' A ' + r_svg + ' ' + r_svg + ' 0 0 1 50 ' + (100 - thick/2) + '" fill="none" stroke="' + customCol + '" stroke-width="' + thick + '" opacity="0.8"/>';

        visualContent = '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style="display:block;">' + svgPath + '</svg>';
    }
    else if (type === 'neon') {
        let parts = extraData.split(',');
        let nType = parts[0] ? parts[0].trim() : '1';
        let thick = parseInt(parts[1]) || 2;
        let customCol = (parts[2] && parts[2].trim().startsWith('#')) ? parts[2].trim() : '#00FFFF';

        block.style.backgroundColor = "transparent";
        block.style.border = "1px dashed rgba(255,255,255,0.3)";
        let svgContent = '';

        let coreThick = Math.max(1, thick * 0.4);

        if (nType === '1') { // Linea H
            block.style.height = "40px"; block.style.width = "200px";
            svgContent = '<line x1="0" y1="50%" x2="100%" y2="50%" stroke="' + customCol + '" stroke-width="' + thick + '" style="filter: drop-shadow(0 0 6px ' + customCol + ');"/>';
            svgContent += '<line x1="0" y1="50%" x2="100%" y2="50%" stroke="#FFFFFF" stroke-width="' + coreThick + '"/>';
        } else if (nType === '2') { // Linea V
            block.style.height = "200px"; block.style.width = "40px";
            svgContent = '<line x1="50%" y1="0" x2="50%" y2="100%" stroke="' + customCol + '" stroke-width="' + thick + '" style="filter: drop-shadow(0 0 6px ' + customCol + ');"/>';
            svgContent += '<line x1="50%" y1="0" x2="50%" y2="100%" stroke="#FFFFFF" stroke-width="' + coreThick + '"/>';
        } else if (nType === '3') { // Circulo
            block.style.height = "100px"; block.style.width = "100px";
            let r = 50 - thick;
            svgContent = '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + customCol + '" stroke-width="' + thick + '" style="filter: drop-shadow(0 0 6px ' + customCol + ');"/>';
            svgContent += '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="#FFFFFF" stroke-width="' + coreThick + '"/>';
        }

        let ratio = (nType === '3') ? 'xMidYMid meet' : 'none';
        visualContent = '<svg viewBox="0 0 100 100" preserveAspectRatio="' + ratio + '" width="100%" height="100%" style="display:block; overflow:visible;">' + svgContent + '</svg>';
    }
    else if (type === 'ticker') {
        block.style.height = "40px"; block.style.width = "350px";
        block.style.backgroundColor = "rgba(0,0,0,0.5)"; block.style.border = "1px solid var(--col-disk)";
        let speedHtml = extraData || 2;
        visualContent = '<div style="width:100%; height:100%; display:flex; align-items:center; overflow:hidden; white-space:nowrap; font-weight:bold; color:var(--col-text);"><marquee scrollamount="' + speedHtml + '"><span style="background:rgba(255,121,198,0.2); border:1px solid var(--col-cpu); padding:2px 6px;"><span style="color:var(--col-cpu)">CPU</span> 45%</span> &nbsp;&nbsp; <span style="background:rgba(241,250,140,0.2); border:1px solid var(--col-ram); padding:2px 6px;"><span style="color:var(--col-ram)">RAM</span> 32%</span> &nbsp;&nbsp; <span style="background:rgba(255,184,108,0.2); border:1px solid var(--col-temp); padding:2px 6px;"><span style="color:var(--col-temp)">TMP</span> 55°C</span> &nbsp;&nbsp; <span style="background:rgba(139,233,253,0.2); border:1px solid var(--col-accent); padding:2px 6px;"><span style="color:var(--col-accent)">FRQ</span> 4.7G</span></marquee></div>';
    }
    else if (type === 'globe_3d') {
        let parts = extraData.split(',');
        block.style.height = "150px"; block.style.width = "150px";
        block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-accent)"; block.style.borderRadius = "50%";
        visualContent = '<div style="display:flex; height:100%; align-items:center; justify-content:center; flex-direction:column; opacity:0.8; font-size: 24px;">🌐<span style="font-size:10px; margin-top:5px;">3D (' + parts[0] + ',' + parts[1] + ')</span></div>';
    }
    else if (type === 'cpu') visualContent = '<div style="display:flex; width:100%; align-items:center; gap:8px;"><span style="color:var(--col-cpu); white-space:nowrap; font-size:13px; font-weight:bold;">CPU: 65%</span><div class="bar-bg" style="margin:0; flex-grow:1;"><div class="bar-fill color-cpu" style="width: 65%;"></div></div></div>';
    else if (type === 'ram') visualContent = '<div style="display:flex; width:100%; align-items:center; gap:8px;"><span style="color:var(--col-ram); white-space:nowrap; font-size:13px; font-weight:bold;">RAM: 4G/16G</span><div class="bar-bg" style="margin:0; flex-grow:1;"><div class="bar-fill color-ram" style="width: 26%;"></div></div></div>';
    else if (type === 'disk') {
        let diskLabel = extraData;
        if (diskLabel.startsWith('/mnt/')) diskLabel = diskLabel.substring(5);
        else if (diskLabel.startsWith('/media/')) diskLabel = diskLabel.substring(7);
        if (diskLabel === '/') diskLabel = 'Root';
        if (diskLabel.length > 10) diskLabel = diskLabel.substring(0, 10) + '..';
        visualContent = '<div style="display:flex; width:100%; align-items:center; gap:8px;"><span style="color:var(--col-disk); white-space:nowrap; font-size:13px; font-weight:bold;">' + diskLabel + ': 120G</span><div class="bar-bg" style="margin:0; flex-grow:1;"><div class="bar-fill color-disk" style="width: 24%;"></div></div></div>';
    }
    else if (type === 'disk_lua') {
        let parts = extraData.split(',');
        let diskPath = parts[0] || '/';
        let diskThick = parts[1] || 8;
        let diskLabel = diskPath === '/' ? 'Root' : (diskPath.split('/').filter(p => p).pop() || diskPath);
        block.style.height = "50px"; block.style.width = "200px";
        block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-disk)";
        visualContent = '<div style="display:flex; flex-direction:column; width:100%; height:100%; justify-content:center;"><div style="display:flex; justify-content:space-between; font-size:13px; font-weight:bold; color:var(--col-text); margin-bottom:5px;"><span>' + diskLabel.toUpperCase() + '</span><span>40G / 100G</span></div><div class="bar-bg" style="margin:0; height:' + diskThick + 'px; border-radius:10px;"><div class="bar-fill color-disk" style="width: 40%; border-radius:10px;"></div></div></div>';
    }
    else if (type === 'temp') visualContent = '<div class="widget-container"><div class="widget-row"><span style="color:var(--col-temp)">Core 0</span><span>45°C</span></div></div>';
    else if (type === 'kernel') visualContent = '<div class="widget-row"><span>Kernel:</span><span style="color:var(--col-accent)">Linux 6.8</span></div>';
    else if (type === 'fan') visualContent = '<div class="widget-row"><span>Fan:</span><span style="color:var(--col-accent)">1200 RPM</span></div>';
    else if (type === 'xinerama') visualContent = '<div class="widget-row"><span>Monitor:</span><span style="color:var(--col-accent)">1 - 3840x2160</span></div>';
    else if (type === 'ip') visualContent = '<div class="widget-row"><span>Pub IP:</span><span style="color:var(--col-accent)">80.12.X.X</span></div>';
    else if (type === 'email') visualContent = '<div class="widget-row"><span>✉️ Mail:</span><span style="color:var(--col-temp)">0 New</span></div>';
    else if (type === 'clock') {
        block.style.minWidth = "180px";
        visualContent = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:5px;"><div style="font-size:28px; font-weight:bold; color:var(--col-accent); line-height:1;">15:45</div><div style="font-size:12px; color:var(--col-text); opacity:0.8;">Tuesday, March 10</div></div>';
    }
    else if (type === 'weather') {
        block.style.minWidth = "160px";
        let locName = extraData ? "(" + extraData + ")" : "Local";
        visualContent = '<div class="widget-container" style="gap:4px; align-items: center;"><div class="widget-row" style="color:var(--col-accent); font-weight:bold; margin-bottom: 2px;">Weather ' + locName + ':</div><div style="display:flex; align-items:center; gap:10px;"><span style="font-size: 20px; font-weight: bold; color: var(--col-disk);">+5°C</span></div><div class="widget-row" style="color:var(--col-text); font-size:12px; font-weight:bold; opacity:0.9;">Clear</div></div>';
    }
    else if (type === 'weather_pro') {
        block.style.minWidth = "220px";
        block.style.minHeight = "150px";
        visualContent = '<div class="widget-container" style="gap:4px; opacity:0.9;"><div class="widget-row" style="color:var(--col-accent); font-weight:bold;">⛅ Weather Pro</div><div class="widget-row">Temp: 22°C / 18°C</div><div class="widget-row">🌧 Prob. Lluvia: 10%</div><div class="widget-row">🌬 Viento: 15 km/h</div><div class="widget-row" style="font-size:10px; color:var(--col-text);">(Auto-Download .sh)</div></div>';
    }
    else if (type === 'media') {
        block.style.minWidth = "200px";
        let playerName = extraData ? "(" + extraData + ")" : "(Auto)";
        visualContent = '<div class="widget-container" style="gap:2px;"><div class="widget-row" style="color:var(--col-accent); font-weight:bold; margin-bottom: 2px;">[▶] Playing ' + playerName + ':</div><div class="widget-row" style="color:var(--col-disk); font-size:12px; margin-left: 10px;">Led Zeppelin - Stairway to Heaven</div><div class="widget-row" style="color:var(--col-text); font-size:11px; margin-left: 10px; opacity:0.8;">Led Zeppelin IV</div></div>';
    }
    else if (type === 'audacious') {
        block.style.minWidth = "220px";
        visualContent = '<div class="widget-container" style="gap:2px;"><div class="widget-row" style="color:var(--col-accent); font-weight:bold; margin-bottom: 2px;">🎵 Audacious:</div><div class="widget-row" style="color:var(--col-disk); font-size:12px; margin-left: 10px;">The Trooper</div><div class="widget-row" style="color:var(--col-text); font-size:11px; margin-left: 10px; opacity:0.8;">01:30 / 04:10</div><div class="bar-bg" style="margin-left:10px; margin-top:3px; height:6px; width:90%;"><div class="bar-fill color-ram" style="width: 35%;"></div></div></div>';
    }
    else if (type === 'net') visualContent = '<div class="widget-container"><div class="widget-row"><span style="color:var(--col-accent)">▼ ' + extraData + '</span><span>1.2 MB/s</span></div><div class="widget-row"><span style="color:var(--col-disk)">▲ ' + extraData + '</span><span>0.3 MB/s</span></div></div>';
    else if (type === 'graph_cpu') { block.style.height = "80px"; visualContent = '<div class="widget-container" style="min-width: 150px;"><div class="graph-box graph-cpu"></div></div>'; }
    else if (type === 'graph_net') { block.style.height = "150px"; visualContent = '<div class="widget-container" style="min-width: 150px;"><span style="color:var(--col-accent); font-size:14px;">▼ Download</span><div class="graph-box graph-net-down"></div><span style="color:var(--col-disk); font-size:14px;">▲ Upload</span><div class="graph-box graph-net-up"></div></div>'; }
    else if (type === 'eq_cpu') {
        block.style.height = "80px"; block.style.width = "200px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-cpu)";
        let count = parseInt(extraData) || 8;
        let barsHtml = "";
        for(let i=0; i<count; i++) {
            let h = Math.floor(Math.random() * 80) + 20;
            barsHtml += '<div class="eq-bar" style="height: ' + h + '%;"></div>';
        }
        visualContent = '<div class="eq-container">' + barsHtml + '</div>';
    }
    else if (type === 'eq_horiz') {
        block.style.height = "150px"; block.style.width = "100px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-ram)";
        let count = parseInt(extraData) || 8;
        let barsHtml = "";
        for(let i=0; i<count; i++) {
            let w = Math.floor(Math.random() * 80) + 20;
            barsHtml += '<div class="eq-bar-horiz" style="width: ' + w + '%; height: calc(100% / ' + count + ' - 2px); background-color: var(--col-ram); margin-bottom: 2px;"></div>';
        }
        visualContent = '<div style="display:flex; flex-direction:column; width:100%; height:100%; justify-content:center;">' + barsHtml + '</div>';
    }
    else if (type === 'eq_circ') {
        block.style.height = "150px"; block.style.width = "150px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-accent)"; block.style.borderRadius = "50%";
        visualContent = '<div style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; color:var(--col-accent); font-size:18px;">🎇 Radial</div>';
    }
    else if (type === 'eq_circ_open') {
        block.style.height = "150px"; block.style.width = "150px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-accent)"; block.style.borderRadius = "50%";
        visualContent = '<div style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; color:var(--col-accent); font-size:18px;">🎛️ Abierto</div>';
    }
    else if (type === 'eq_concent') {
        block.style.height = "150px"; block.style.width = "150px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-accent)"; block.style.borderRadius = "50%";
        visualContent = '<div style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; color:var(--col-accent); font-size:18px;">🎯 Concent.</div>';
    }
    else if (type === 'eq_concent_open') {
        block.style.height = "150px"; block.style.width = "150px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-accent)"; block.style.borderRadius = "50%";
        visualContent = '<div style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; color:var(--col-accent); font-size:18px;">⏱️ C. Abierto</div>';
    }
    else if (type === 'ring_cpu') { block.style.height = "120px"; block.style.width = "120px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-cpu)"; visualContent = '<div class="ring-container" style="background: conic-gradient(var(--col-cpu) 65%, rgba(255,255,255,0.05) 0);"><div class="ring-inner"><span class="ring-val" style="color:var(--col-cpu)">65%</span><span class="ring-lbl">CPU</span></div></div>'; }
    else if (type === 'ring_ram') { block.style.height = "120px"; block.style.width = "120px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-ram)"; visualContent = '<div class="ring-container" style="background: conic-gradient(var(--col-ram) 45%, rgba(255,255,255,0.05) 0);"><div class="ring-inner"><span class="ring-val" style="color:var(--col-ram)">45%</span><span class="ring-lbl">RAM</span></div></div>'; }
    else if (type === 'ring_gpu_dual') {
        let parts = extraData.split(',');
        let vendor = parts[0] || 'NVIDIA';
        let gpuId = parts[1] || '0';
        block.style.height = "160px"; block.style.width = "160px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-disk)";
        visualContent = '<div class="dual-ring-bg"><div class="dual-ring-inner"><span style="color:var(--col-text); font-weight:bold; font-size:1.1rem; margin-top:-10px;">' + vendor + ' ' + gpuId + '</span><span style="color:var(--col-temp); font-size:0.7rem; margin-top:2px;">55°C</span><span style="color:var(--col-disk); font-size:0.7rem;">40%</span></div></div>';
    }
    else if (type === 'spiral_rev') {
        let parts = extraData.split(',');
        block.style.height = "120px"; block.style.width = "120px"; block.style.backgroundColor = "transparent"; block.style.border = "2px dashed var(--col-disk)"; block.style.borderRadius = "50%";
        visualContent = '<div style="display:flex; height:100%; align-items:center; justify-content:center; opacity:0.7;">🌀 ' + parts[0] + '</div>';
    }
    else if (type === 'spiral_dna') {
        block.style.height = "250px"; block.style.width = "80px"; block.style.backgroundColor = "transparent"; block.style.border = "2px dashed var(--col-cpu)"; block.style.borderRadius = "10px";
        visualContent = '<div style="display:flex; height:100%; align-items:center; justify-content:center; flex-direction:column; opacity:0.8; font-size: 24px;">🧬<span style="font-size:10px; margin-top:5px;">ADN (' + extraData + 'px)</span></div>';
    }
    else if (type === 'graph_fluid') {
        block.style.height = "80px"; block.style.width = "180px"; block.style.backgroundColor = "rgba(139, 233, 253, 0.05)"; block.style.border = "1px solid var(--col-accent)"; block.style.borderBottom = "3px solid var(--col-accent)";
        visualContent = '<div style="display:flex; height:100%; align-items:center; justify-content:center; flex-direction:column; opacity:0.8; font-size:12px;">🌊 Ondas Red Bezier<br><span style="color:var(--col-disk); font-weight:bold;">' + extraData + '</span></div>';
    }
    else if (type === 'text_vert') {
        block.style.height = "300px"; block.style.width = "50px"; block.style.backgroundColor = "rgba(0,0,0,0.5)"; block.style.border = "2px solid var(--col-temp)";
        let parsedData = extraData.split(',');
        let txtStr = parsedData[0] || "TEXT";
        let fontSizeWeb = parsedData[1] ? parsedData[1] + "px" : "16px";
        let stackedChars = txtStr.split('').join('<br>');
        visualContent = '<div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:space-between; font-size:' + fontSizeWeb + '; color:var(--col-accent); font-weight:bold; line-height:1; text-align:center;">' + stackedChars + '</div>';
    }
    else if (type === 'text_horiz') {
        block.style.height = "50px"; block.style.width = "250px"; block.style.backgroundColor = "rgba(0,0,0,0.5)"; block.style.border = "2px solid var(--col-temp)";
        let parsedData = extraData.split(',');
        let txtStr = parsedData[0] || "TEXT";
        let fontSizeWeb = parsedData[1] ? parsedData[1] + "px" : "24px";
        visualContent = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:' + fontSizeWeb + '; color:var(--col-accent); font-weight:bold; text-align:center;">' + txtStr + '</div>';
    }
    else if (type === 'image') {
        block.style.height = "150px"; block.style.width = "150px"; block.style.backgroundColor = "rgba(0,0,0,0.5)"; block.style.border = "2px solid var(--col-disk)";
        visualContent = '<div style="width:100%; height:100%; color:var(--col-disk); display:flex; font-weight:bold; align-items:center; justify-content:center; font-size:12px; text-align:center;">STATIC PNG<br>' + extraData.split('/').pop() + '</div>';
    }
    else if (type === 'anim_png') {
        block.style.height = "150px"; block.style.width = "150px"; block.style.backgroundColor = "rgba(0,0,0,0.5)"; block.style.border = "2px dashed var(--col-accent)";
        let parts = extraData.split(',');
        visualContent = '<div style="width:100%; height:100%; color:var(--col-accent); display:flex; flex-direction:column; font-weight:bold; align-items:center; justify-content:center; font-size:12px; text-align:center;">🎬 ANIMATED PNG<br><span style="font-size:10px; opacity:0.8">' + parts[0] + '*.png<br>Frames: ' + parts[1] + '</span></div>';
    }
    else if (type === 'analog_clock') {
        block.style.height = "150px"; block.style.width = "150px"; block.style.backgroundColor = "transparent"; block.style.border = "1px dashed var(--col-accent)";
        visualContent = '<div class="analog-clock"></div>';
    }

    let badgeHtml = needsBadge ? '<div class="size-badge"></div>' : '';
    let btnDisplay = isPreviewMode ? 'none' : 'block';
    let titleDisplay = (showTitle && !isPreviewMode) ? 'block' : 'none';

    block.innerHTML = '<span class="close-btn" style="display: ' + btnDisplay + '" onclick="this.parentElement.remove()">✖</span><span class="block-title" style="display: ' + titleDisplay + '">' + title + '</span>' + visualContent + badgeHtml;

    if(isPreviewMode) {
        block.style.backgroundColor = 'transparent';
        block.style.border = 'none'; block.style.boxShadow = 'none'; block.style.resize = 'none';
    }

    if(needsBadge && canvas) resizeObserver.observe(block);

    block.addEventListener('dblclick', function(e) {
        let currentX = block.dataset.offx || "0";
        let currentY = block.dataset.offy || "0";

        let newX = prompt("SNIPER MODE X: Horizontal ajuste (+ o - pixels):", currentX);
        if (newX === null) return;
        let newY = prompt("SNIPER MODE Y: Vertical ajuste (+ o - pixels):", currentY);
        if (newY === null) return;

        block.dataset.offx = newX;
        block.dataset.offy = newY;

        let offsetBadge = block.querySelector('.offset-badge');
        if(!offsetBadge) {
            offsetBadge = document.createElement('div');
            offsetBadge.className = 'offset-badge';
            offsetBadge.style.cssText = "position:absolute; top:2px; left:2px; background:rgba(255,85,85,0.9); color:white; font-size:10px; padding:1px 4px; border-radius:3px; pointer-events:none; z-index:30;";
            block.appendChild(offsetBadge);
        }

        if (newX == 0 && newY == 0) {
            offsetBadge.style.display = 'none';
        } else {
            offsetBadge.style.display = 'block';
            offsetBadge.innerText = '🎯 ' + newX + 'x, ' + newY + 'y';
        }
    });

    let isDragging = false; let startX, startY, initialBlockX, initialBlockY;
    block.addEventListener('mousedown', function(e) {
        if(e.target.classList.contains('close-btn')) return;
        const rect = block.getBoundingClientRect();
        if ((e.clientX > rect.right - 25) && (e.clientY > rect.bottom - 25)) return;
        isDragging = true; startX = e.clientX; startY = e.clientY;
        initialBlockX = block.offsetLeft; initialBlockY = block.offsetTop; block.style.zIndex = ++zIndexCounter;
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const scaleEl = document.getElementById('config-scale');
        const currentScale = scaleEl ? (parseFloat(scaleEl.value) || 1.0) : 1.0;
        let newX = initialBlockX + ((e.clientX - startX) / currentScale);
        let newY = initialBlockY + ((e.clientY - startY) / currentScale);
        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
        newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
        block.style.left = newX + 'px';
        block.style.top = newY + 'px';
    });
    document.addEventListener('mouseup', function() { isDragging = false; });
    if(canvas) canvas.appendChild(block);
}

const buttons = [
    { id: 'add-line', func: function() {
        let res = prompt("Orientación (h/v), Grosor y Color opcional (Ej: h, 2, #FF5555):", "h,2");
        if (res) createBlock('Línea/Caja', 'line', res);
    }},
{ id: 'add-line-diag', func: function() {
    let res = prompt("Dirección (1=↘, 2=↗), Grosor y Color opcional (Ej: 1, 2, #00FF00):", "1,2");
    if (res) createBlock('Diagonal', 'line_diag', res);
}},
{ id: 'add-geometry', func: function() {
    let res = prompt("Tipo (1=Círculo, 2=Arriba, 3=Abajo, 4=Izq, 5=Der), Grosor y Color:\nEj: 1, 4, #FF00FF", "1,2");
    if (res) createBlock('Geometría', 'geometry', res);
}},
{ id: 'add-neon', func: function() {
    let res = prompt("⚡ EFECTO NEÓN\nTipo (1=Línea Horiz, 2=Línea Vert, 3=Círculo), Grosor y Color Hex:\nEj: 1, 6, #00FFFF", "1,6,#00FFFF");
    if (res) createBlock('Neón', 'neon', res);
}},
{ id: 'add-ticker', func: function() {
    let res = prompt("Velocidad de desplazamiento del Ticker (ej: 2 normal, 5 rápido):", "2");
    if (res) createBlock('Ticker', 'ticker', res);
}},
{ id: 'add-globe', func: function() {
    let res = prompt("Velocidad X, Velocidad Y, Color Base, Color Llenado\n(Ej: 0.01, 0.03, #8BE9FD, #FF79C6):", "0.01,0.03,#8BE9FD,#F1FA8C");
    if (res) createBlock('Globo 3D', 'globe_3d', res);
}},
{ id: 'add-cpu', func: function() { createBlock('CPU Bar', 'cpu'); } },
{ id: 'add-ram', func: function() { createBlock('RAM Bar', 'ram'); } },
{ id: 'add-temp', func: function() { createBlock('Temperature', 'temp'); } },
{ id: 'add-fan', func: function() { createBlock('Fan', 'fan'); } },
{ id: 'add-kernel', func: function() { createBlock('System', 'kernel'); } },
{ id: 'add-xinerama', func: function() { createBlock('Monitor', 'xinerama'); } },
{ id: 'add-ip', func: function() { createBlock('External IP', 'ip'); } },
{ id: 'add-email', func: function() { createBlock('Email', 'email'); } },
{ id: 'add-top-cpu', func: function() { createBlock('Top CPU', 'top_cpu'); } },
{ id: 'add-top-ram', func: function() { createBlock('Top RAM', 'top_ram'); } },
{ id: 'add-clock', func: function() { createBlock('Clock', 'clock'); } },
{ id: 'add-weather', func: function() { const res = prompt("Introduce tu ciudad (ej. Madrid). Vacío para IP automática:", ""); createBlock('Weather', 'weather', res ? res.trim() : ""); } },
{ id: 'add-weather-pro', func: function() { createBlock('Weather Pro', 'weather_pro'); } },
{ id: 'add-media', func: function() { const res = prompt("Reproductor (ej: spotify, vlc). Vacío para Auto:", ""); if(res !== null) createBlock('PlayerCTL', 'media', res.trim()); } },
{ id: 'add-audacious', func: function() { createBlock('Audacious', 'audacious'); } },
{ id: 'add-eq-cpu', func: function() { const res = prompt("¿Cuántos hilos de CPU? (ej: 16):", "16"); if (res) createBlock('CPU EQ Vert.', 'eq_cpu', res); } },
{ id: 'add-eq-horiz', func: function() { const res = prompt("¿Cuántos hilos de CPU? (ej: 16):", "16"); if (res) createBlock('CPU EQ Horiz.', 'eq_horiz', res); } },
{ id: 'add-eq-circ', func: function() { const res = prompt("¿Cuántos hilos de CPU? (ej: 16):", "16"); if (res) createBlock('CPU EQ Radial', 'eq_circ', res); } },
{ id: 'add-eq-circ-open', func: function() { const res = prompt("¿Cuántos hilos de CPU? (ej: 16):", "16"); if (res) createBlock('CPU EQ Abierto', 'eq_circ_open', res); } },
{ id: 'add-eq-concent', func: function() { const res = prompt("¿Cuántos hilos de CPU? (ej: 16):", "16"); if (res) createBlock('CPU EQ Circular', 'eq_concent', res); } },
{ id: 'add-eq-concent-open', func: function() { const res = prompt("¿Cuántos hilos de CPU? (ej: 16):", "16"); if (res) createBlock('CPU EQ Concent. Abierto', 'eq_concent_open', res); } },
{ id: 'add-graph-cpu', func: function() { createBlock('CPU Graph', 'graph_cpu'); } },
{ id: 'add-ring-cpu', func: function() { createBlock('CPU Ring', 'ring_cpu'); } },
{ id: 'add-ring-ram', func: function() { createBlock('RAM Ring', 'ring_ram'); } },
{ id: 'add-analog-clock', func: function() { createBlock('Analog Clock', 'analog_clock'); } },
{ id: 'add-spiral-rev', func: function() { let v = prompt("Variable y Grosor (Ej: cpu,4 o mem,6):", "cpu,4"); if(v) createBlock('Espiral', 'spiral_rev', v); } },
{ id: 'add-spiral-dna', func: function() { let t = prompt("Grosor del ADN (Ej: 4):", "4"); if(t) createBlock('ADN', 'spiral_dna', t); } },
{ id: 'add-graph-fluid', func: function() { let v = prompt("Interfaz de RED (Ej: wlan0):", "wlan0"); if(v) createBlock('Ondas Red', 'graph_fluid', v); } },
{ id: 'add-ring-gpu-dual', func: function() {
    let vendor = prompt("GPU (Escribe AMD o NVIDIA):", "NVIDIA");
    if (!vendor) return;
    vendor = vendor.toUpperCase();
    if (vendor !== 'AMD' && vendor !== 'NVIDIA') vendor = 'NVIDIA';
    const res = prompt("GPU ID (0 para primaria...):", "0");
    if (res !== null) createBlock('Dual GPU Ring', 'ring_gpu_dual', vendor + "," + (res.trim() || "0"));
}},
{ id: 'add-net', func: function() { const res = prompt("Interfaz (ej: enp3s0, wlan0):", "enp3s0"); if (res) createBlock('Net (' + res + ')', 'net', res); } },
{ id: 'add-disk', func: function() { let res = prompt("Ruta ABSOLUTA (ej: /mnt/Datos):", "/"); if (res) { res = res.trim(); if (!res.startsWith('/')) res = '/' + res; createBlock('Disk', 'disk', res); } } },
{ id: 'add-disk-lua', func: function() { let res = prompt("Ruta ABSOLUTA y Grosor (ej: /home,8):", "/,8"); if (res) { let parts = res.split(','); let p = parts[0].trim(); if (!p.startsWith('/')) p = '/' + p; let t = parts[1] ? parts[1].trim() : "8"; createBlock('Disk Lua', 'disk_lua', p + "," + t); } } },
{ id: 'add-graph-net', func: function() { const res = prompt("Interfaz de red (ej: wlan0):", "wlan0"); if (res) createBlock('Net Graph', 'graph_net', res); } },
{ id: 'add-text-vert', func: function() { const res = prompt("Texto, Tamaño, Espaciado (Ej: ARCH,40,5):", "ARCH,40,0"); if (res) createBlock('Vertical Text', 'text_vert', res); } },
{ id: 'add-text-horiz', func: function() { const res = prompt("Texto, Tamaño, Espaciado (Ej: HOLA,30,8):", "HOLA,30,0"); if (res) createBlock('Horizontal Text', 'text_horiz', res); } },
{ id: 'add-image', func: function() { const res = prompt("Ruta absoluta al PNG:", "/home/usuario/imagen.png"); if (res) createBlock('PNG Image', 'image', res); } },
{ id: 'add-anim-png', func: function() {
    const path = prompt("Ruta del prefijo (ej: /anim/frame_):", "/home/usuario/anim/frame_");
    if (!path) return;
    const frames = prompt("Número total de frames (ej: 30):", "30");
    if (!frames) return;
    const speed = prompt("Velocidad (1 = rapido, 2 = mitad...):", "1");
    createBlock('Animated PNG', 'anim_png', path + "," + frames + "," + (speed || "1"));
}}
];

for(let i=0; i<buttons.length; i++) {
    let btn = document.getElementById(buttons[i].id);
    if(btn) btn.addEventListener('click', buttons[i].func);
}

let previewBtn = document.getElementById('toggle-preview');
if(previewBtn) {
    previewBtn.addEventListener('click', function() {
        isPreviewMode = !isPreviewMode;
        let blocks = document.querySelectorAll('.conky-block');
        for(let i=0; i<blocks.length; i++) {
            let block = blocks[i];
            if (isPreviewMode) {
                block.style.backgroundColor = 'transparent'; block.style.border = 'none'; block.style.boxShadow = 'none'; block.style.resize = 'none';
                let btn = block.querySelector('.close-btn'); if(btn) btn.style.display = 'none';
                let title = block.querySelector('.block-title'); if(title) title.style.display = 'none';
                let badge = block.querySelector('.size-badge'); if(badge) badge.style.display = 'none';
                let offBadge = block.querySelector('.offset-badge'); if(offBadge) offBadge.style.display = 'none';
            } else {
                const isLua = ['line', 'line_diag', 'geometry', 'neon', 'ring_cpu', 'ring_ram', 'ring_gpu_dual', 'disk_lua', 'eq_cpu', 'eq_horiz', 'eq_circ', 'eq_concent', 'eq_circ_open', 'eq_concent_open', 'analog_clock', 'spiral_rev', 'spiral_dna', 'graph_fluid', 'ticker'].indexOf(block.dataset.type) !== -1;
                block.style.backgroundColor = isLua ? 'transparent' : 'rgba(68, 71, 90, 0.85)';
                block.style.border = isLua ? '1px dashed var(--col-accent)' : '1px solid var(--col-accent)';
                if(block.dataset.type === 'neon') block.style.border = '1px dashed rgba(255,255,255,0.3)';
                block.style.boxShadow = isLua ? 'none' : '0 4px 6px rgba(0,0,0,0.3)';
                block.style.resize = 'both';
                let btn = block.querySelector('.close-btn'); if(btn) btn.style.display = 'block';
                let title = block.querySelector('.block-title');
                const noTitle = ['line', 'line_diag', 'geometry', 'neon', 'disk', 'disk_lua', 'cpu', 'ram', 'graph_net', 'image', 'anim_png', 'text_vert', 'text_horiz', 'media', 'audacious', 'clock', 'weather', 'weather_pro', 'ticker'].indexOf(block.dataset.type) !== -1;
                if(title && !isLua && !noTitle) title.style.display = 'block';
                let badge = block.querySelector('.size-badge'); if(badge) badge.style.display = 'block';
                let offBadge = block.querySelector('.offset-badge');
                if(offBadge && (block.dataset.offx != 0 || block.dataset.offy != 0)) offBadge.style.display = 'block';
            }
        }
        if(canvas) {
            canvas.style.border = isPreviewMode ? 'none' : '2px dashed #6272a4';
            canvas.style.backgroundImage = isPreviewMode ? 'none' : 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)';
        }
    });
}

let saveBtn = document.getElementById('btn-save');
if(saveBtn) {
    saveBtn.addEventListener('click', function() {
        const project = {
            config: {
                width: document.getElementById('config-width') ? document.getElementById('config-width').value : "",
                             height: document.getElementById('config-height') ? document.getElementById('config-height').value : "",
                             align: document.getElementById('config-align') ? document.getElementById('config-align').value : "",
                             luapath: document.getElementById('config-luapath') ? document.getElementById('config-luapath').value : "",
                             font: document.getElementById('config-font') ? document.getElementById('config-font').value : "",
                             fontCustom: document.getElementById('config-font-custom') ? document.getElementById('config-font-custom').value : "",
                             thickness: document.getElementById('config-thickness') ? document.getElementById('config-thickness').value : "",
                             scale: document.getElementById('config-scale') ? document.getElementById('config-scale').value : "",
                             monitor: document.getElementById('config-monitor') ? document.getElementById('config-monitor').value : "",
                             lineheight: document.getElementById('config-lineheight') ? document.getElementById('config-lineheight').value : "",
                             col_text: colorInputs.text ? colorInputs.text.value : "",
                             col_accent: colorInputs.accent ? colorInputs.accent.value : "",
                             col_cpu: colorInputs.cpu ? colorInputs.cpu.value : "",
                             col_ram: colorInputs.ram ? colorInputs.ram.value : "",
                             col_disk: colorInputs.disk ? colorInputs.disk.value : "",
                             col_temp: colorInputs.temp ? colorInputs.temp.value : ""
            },
            blocks: []
        };
        let cBlocks = document.querySelectorAll('.conky-block');
        for(let i=0; i<cBlocks.length; i++) {
            let b = cBlocks[i];
            project.blocks.push({
                title: b.dataset.title, type: b.dataset.type, extra: b.dataset.extra,
                left: b.style.left, top: b.style.top, width: b.style.width, height: b.style.height, zIndex: b.style.zIndex,
                offx: b.dataset.offx || 0, offy: b.dataset.offy || 0
            });
        }
        localStorage.setItem('conkyForgeProject', JSON.stringify(project)); alert("Diseño guardado.");
    });
}

let clearBtn = document.getElementById('btn-clear');
if(clearBtn) {
    clearBtn.addEventListener('click', function() { if(confirm("¿Limpiar lienzo?") && canvas) canvas.innerHTML = ''; });
}

let loadBtn = document.getElementById('btn-load');
if(loadBtn) {
    loadBtn.addEventListener('click', function() {
        let savedData = localStorage.getItem('conkyForgeProject'); if (!savedData) return alert("No hay datos guardados.");
        const project = JSON.parse(savedData);

        let safeSet = function(id, val) { let el = document.getElementById(id); if(el && val) el.value = val; };

        safeSet('config-width', project.config.width);
        safeSet('config-height', project.config.height);
        safeSet('config-align', project.config.align);
        safeSet('config-luapath', project.config.luapath);

        if(project.config.font && document.getElementById('config-font')) {
            document.getElementById('config-font').value = project.config.font;
            if(project.config.font === 'CUSTOM' && document.getElementById('config-font-custom')) {
                document.getElementById('config-font-custom').style.display = 'block';
                document.getElementById('config-font-custom').value = project.config.fontCustom || '';
                document.getElementById('config-font').style.width = '50%';
            }
            updateWebFont();
        }
        safeSet('config-thickness', project.config.thickness);

        if(project.config.col_text && colorInputs.text) {
            colorInputs.text.value = project.config.col_text;
            if(colorInputs.accent) colorInputs.accent.value = project.config.col_accent;
            if(colorInputs.cpu) colorInputs.cpu.value = project.config.col_cpu;
            if(colorInputs.ram) colorInputs.ram.value = project.config.col_ram;
            if(project.config.col_disk && colorInputs.disk) colorInputs.disk.value = project.config.col_disk;
            if(project.config.col_temp && colorInputs.temp) colorInputs.temp.value = project.config.col_temp;
            updateColors();
        }

        safeSet('config-monitor', project.config.monitor);
        if(project.config.scale && document.getElementById('config-scale')) { document.getElementById('config-scale').value = project.config.scale; document.getElementById('config-scale').dispatchEvent(new Event('input')); }
        safeSet('config-lineheight', project.config.lineheight);

        if(canvas) {
            canvas.style.width = project.config.width + 'px'; canvas.style.height = project.config.height + 'px'; canvas.innerHTML = '';
            let maxZ = 10;
            for(let i=0; i<project.blocks.length; i++) {
                let b = project.blocks[i];
                createBlock(b.title, b.type, b.extra); const newBlock = canvas.lastElementChild;
                newBlock.style.left = b.left; newBlock.style.top = b.top; if (b.width) newBlock.style.width = b.width; if (b.height) newBlock.style.height = b.height; newBlock.style.zIndex = b.zIndex;
                newBlock.dataset.offx = b.offx || 0;
                newBlock.dataset.offy = b.offy || 0;
                if(b.offx != 0 || b.offy != 0) {
                    let offsetBadge = document.createElement('div');
                    offsetBadge.className = 'offset-badge';
                    offsetBadge.style.cssText = "position:absolute; top:2px; left:2px; background:rgba(255,85,85,0.9); color:white; font-size:10px; padding:1px 4px; border-radius:3px; pointer-events:none; z-index:30;";
                    offsetBadge.innerText = '🎯 ' + b.offx + 'x, ' + b.offy + 'y';
                    newBlock.appendChild(offsetBadge);
                }
                if (parseInt(b.zIndex) > maxZ) maxZ = parseInt(b.zIndex);
            }
            zIndexCounter = maxZ + 1; alert("Diseño cargado.");
        }
    });
}

let genBtn = document.getElementById('generate-btn');
if(genBtn) {
    genBtn.addEventListener('click', function() {
        if(!canvas) return;
        const blocks = Array.from(canvas.querySelectorAll('.conky-block'));
        if (blocks.length === 0) return alert("El lienzo está vacío.");

        blocks.sort(function(a, b) { return (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0); });

        let elLua = document.getElementById('config-luapath');
        const luaPath = elLua ? elLua.value.trim() : "/home/usuario/.config/conky/visuals.lua";
        let elFont = document.getElementById('config-font');
        let userFont = elFont ? elFont.value : "DejaVu Sans";
        if (userFont === 'CUSTOM') {
            let elCustom = document.getElementById('config-font-custom');
            userFont = elCustom ? elCustom.value.trim() : "DejaVu Sans";
        }

        let elThick = document.getElementById('config-thickness');
        const baseThickness = elThick ? parseInt(elThick.value) || 10 : 10;
        let elScale = document.getElementById('config-scale');
        const s = elScale ? parseFloat(elScale.value) || 1.0 : 1.0;
        let elMon = document.getElementById('config-monitor');
        const monitorId = elMon ? elMon.value || "1" : "1";
        const fontSize = 12;
        let elLine = document.getElementById('config-lineheight');
        const lineHeight = elLine ? parseInt(elLine.value) || 16 : 16;

        let elW = document.getElementById('config-width');
        const confW = elW ? elW.value || 400 : 400;
        let elH = document.getElementById('config-height');
        const confH = elH ? elH.value || 1200 : 1200;

        const hexText = colorInputs.text ? colorInputs.text.value.substring(1) : "FFFFFF";
        const hexAccent = colorInputs.accent ? colorInputs.accent.value.substring(1) : "8BE9FD";
        const hexCpu = colorInputs.cpu ? colorInputs.cpu.value.substring(1) : "FF79C6";
        const hexRam = colorInputs.ram ? colorInputs.ram.value.substring(1) : "F1FA8C";
        const hexDisk = colorInputs.disk ? colorInputs.disk.value.substring(1) : "50FA7B";
        const hexTemp = colorInputs.temp ? colorInputs.temp.value.substring(1) : "FFB86C";

        let elAlign = document.getElementById('config-align');
        let confAlign = elAlign ? elAlign.value : "top_right";

        // BASE COMÚN PARA AMBOS CONKYS
        let baseConfig = "conky.config = {\n";
        baseConfig += "    total_run_times = 0,\n";
        baseConfig += "    alignment = '" + confAlign + "',\n";
        baseConfig += "    gap_x = 0,\n";
        baseConfig += "    gap_y = 0,\n";
        baseConfig += "    border_inner_margin = 0,\n";
        baseConfig += "    border_outer_margin = 0,\n";
        baseConfig += "    minimum_width = " + confW + ",\n";
        baseConfig += "    minimum_height = " + confH + ",\n";
        baseConfig += "    maximum_width = " + confW + ",\n";
        baseConfig += "    own_window = true,\n";
        baseConfig += "    own_window_type = \"normal\",\n";
        baseConfig += "    own_window_hints = \"undecorated, below, sticky, skip_taskbar, skip_pager\",\n";
        baseConfig += "    own_window_transparent = true,\n";
        baseConfig += "    own_window_argb_visual = true,\n";
        baseConfig += "    own_window_argb_value = 0,\n";
        baseConfig += "    own_window_colour = \"000000\",\n";
        baseConfig += "    double_buffer = true,\n";
        baseConfig += "    disable_auto_reload = false,\n";
        baseConfig += "    xinerama_head = " + monitorId + ",\n";
        baseConfig += "    use_xft = true,\n";
        baseConfig += "    extra_newline = false,\n";
        baseConfig += "    font = \"" + userFont + ":size=" + fontSize + "\",\n";
        baseConfig += "    short_units = true,\n";
        baseConfig += "    draw_graph_borders = false,\n";
        baseConfig += "    temperature_unit = \"celsius\",\n";
        baseConfig += "    draw_shades = false,\n";
        baseConfig += "    default_color = \"" + hexText + "\",\n";
        baseConfig += "    default_outline_color = \"blue\",\n";

        // 1. CONKY ANIMACIONES (0.1s FPS - SIN TEXTO)
        let animCode = baseConfig;
        animCode += "    update_interval = 0.1,\n";
        animCode += "    cpu_avg_samples = 1,\n";
        animCode += "    net_avg_samples = 1,\n";
        animCode += "    lua_load = '" + luaPath + "',\n";
        animCode += "    lua_draw_hook_pre = 'conky_main_visuals',\n";
        animCode += "}\n\nconky.text = [[\n]]\n";

        // 2. CONKY DATOS (1.0s FPS - SOLO TEXTO PARA EVITAR PARKINSON)
        let datosCode = baseConfig;
        datosCode += "    update_interval = 1.0,\n";
        datosCode += "    cpu_avg_samples = 2,\n";
        datosCode += "    net_avg_samples = 2,\n";
        datosCode += "}\n\nconky.text = [[\n";

        let currentY = 0;
        let maxAbsoluteBottom = 0;
        let hasWeatherPro = false;

        for(let i=0; i<blocks.length; i++) {
            let block = blocks[i];
            let type = block.dataset.type;
            let extra = block.dataset.extra;
            let xPos = (Math.floor(block.offsetLeft * s) || 0) + parseInt(block.dataset.offx || 0);
            let yPos = (Math.floor(block.offsetTop * s) || 0) + parseInt(block.dataset.offy || 0);
            let bWidth = Math.floor(block.offsetWidth * s) || 40;
            let bHeight = Math.floor(block.offsetHeight * s) || 20;

            if (type === 'weather_pro') hasWeatherPro = true;
            let elementBottom = yPos + bHeight;
            if (elementBottom > maxAbsoluteBottom) maxAbsoluteBottom = elementBottom;

            const nonTextTypes = ['line', 'line_diag', 'geometry', 'neon', 'ticker', 'ring_cpu', 'ring_ram', 'ring_gpu_dual', 'disk_lua', 'text_vert', 'text_horiz', 'eq_cpu', 'eq_horiz', 'eq_circ', 'eq_concent', 'eq_circ_open', 'eq_concent_open', 'image', 'anim_png', 'analog_clock', 'spiral_rev', 'spiral_dna', 'graph_fluid', 'globe_3d'];

            if (nonTextTypes.indexOf(type) === -1) {
                let diffY = yPos - currentY;
                if (diffY !== 0) datosCode += "${voffset " + diffY + "}";

                if (type === 'cpu') {
                    let barW = Math.max(10, Math.floor(bWidth * 0.4));
                    let textSpace = bWidth - barW;
                    datosCode += "${goto " + xPos + "}${color " + hexCpu + "}CPU:${color " + hexText + "} ${cpu cpu0}% ${goto " + (xPos + textSpace) + "}${color " + hexCpu + "}${cpubar " + baseThickness + "," + barW + "}${color " + hexText + "}\n";
                    currentY = yPos + lineHeight;
                }
                else if (type === 'ram') {
                    let barW = Math.max(10, Math.floor(bWidth * 0.4));
                    let textSpace = bWidth - barW;
                    datosCode += "${goto " + xPos + "}${color " + hexRam + "}RAM:${color " + hexText + "} ${mem} / ${memmax} ${goto " + (xPos + textSpace) + "}${color " + hexRam + "}${membar " + baseThickness + "," + barW + "}${color " + hexText + "}\n";
                    currentY = yPos + lineHeight;
                }
                else if (type === 'disk') {
                    let barW = Math.max(10, Math.floor(bWidth * 0.35));
                    let textSpace = bWidth - barW;
                    let diskLabel = extra;
                    if (diskLabel.startsWith('/mnt/')) diskLabel = diskLabel.substring(5);
                    else if (diskLabel.startsWith('/media/')) diskLabel = diskLabel.substring(7);
                    if (diskLabel === '/') diskLabel = 'Root';
                    if (diskLabel.length > 10) diskLabel = diskLabel.substring(0, 10) + '..';
                    datosCode += "${goto " + xPos + "}${color " + hexDisk + "}" + diskLabel + ":${color " + hexText + "} ${fs_used " + extra + "} / ${fs_size " + extra + "} ${goto " + (xPos + textSpace) + "}${color " + hexDisk + "}${fs_bar " + baseThickness + "," + barW + " " + extra + "}${color " + hexText + "}\n";
                    currentY = yPos + lineHeight;
                }
                else if (type === 'temp') { datosCode += "${goto " + xPos + "}${color " + hexTemp + "}TEMP:${color " + hexText + "} ${hwmon 1 temp 1}°C\n"; currentY = yPos + lineHeight; }
                else if (type === 'kernel') { datosCode += "${goto " + xPos + "}${color " + hexText + "}Kernel: ${color " + hexAccent + "}${kernel}\n"; currentY = yPos + lineHeight; }
                else if (type === 'fan') { datosCode += "${goto " + xPos + "}${color " + hexText + "}Fan: ${color " + hexAccent + "}${execi 5 bash -c \"sensors | grep -i 'rpm' | grep -Eo '[0-9]{3,5}' | head -n 1 || echo 'N/A'\"} RPM\n"; currentY = yPos + lineHeight; }
                else if (type === 'xinerama') { datosCode += "${goto " + xPos + "}${color " + hexText + "}Monitor: ${color " + hexAccent + "}${execi 3600 xrandr | grep '*' | awk 'NR==1{print $1}'}\n"; currentY = yPos + lineHeight; }
                else if (type === 'ip') { datosCode += "${goto " + xPos + "}${color " + hexText + "}Pub IP: ${color " + hexAccent + "}${execi 3600 curl -s -m 3 ifconfig.me}\n"; currentY = yPos + lineHeight; }
                else if (type === 'email') { datosCode += "${goto " + xPos + "}${color " + hexText + "}Email: ${color " + hexTemp + "}${execi 300 python3 ~/.config/conky/mail.py} New\n"; currentY = yPos + lineHeight; }
                else if (type === 'clock') {
                    datosCode += "${goto " + xPos + "}${color " + hexAccent + "}${font " + userFont + ":bold:size=24}${time %H:%M}${font}\n";
                    datosCode += "${goto " + xPos + "}${voffset 4}${color " + hexText + "}${font " + userFont + ":size=11}${time %A, %d %B}${font}\n";
                    currentY = yPos + 40;
                }
                else if (type === 'weather') {
                    let locCmd = extra ? extra.replace(/ /g, '+') : "";
                    datosCode += "${goto " + xPos + "}${color " + hexAccent + "}Weather:\n";
                    datosCode += "${goto " + xPos + "}${voffset 4}${goto " + (xPos + 10) + "}${font " + userFont + ":size=16}${color " + hexDisk + "}${execi 1800 curl -sL -m 5 -A \"Mozilla/5.0\" \"https://wttr.in/" + locCmd + "?format=%25t\"}${font}\n";
                    datosCode += "${goto " + xPos + "}${voffset 4}${goto " + (xPos + 10) + "}${color " + hexText + "}${execi 1800 curl -sL -m 5 -A \"Mozilla/5.0\" -H \"Accept-Language: en\" \"https://wttr.in/" + locCmd + "?format=%25C\"}\n";
                    currentY = yPos + (lineHeight * 3) + 8;
                }
                else if (type === 'weather_pro') {
                    datosCode += "${execpi 1800 ~/.config/conky/weather.sh " + xPos + "}\n";
                    currentY = yPos + (lineHeight * 8);
                }
                else if (type === 'media') {
                    let playerArg = extra ? "-p " + extra : "";
                    datosCode += "${goto " + xPos + "}${color " + hexAccent + "}[▶] Playing:\n";
                    datosCode += "${goto " + xPos + "}${voffset 2}${goto " + (xPos + 10) + "}${color " + hexDisk + "}${execi 2 playerctl " + playerArg + " metadata --format \"{{ title }}\" 2>/dev/null | cut -c1-40}\n";
                    datosCode += "${goto " + xPos + "}${voffset 2}${goto " + (xPos + 10) + "}${color " + hexText + "}${execi 2 playerctl " + playerArg + " metadata --format \"{{ artist }}\" 2>/dev/null | cut -c1-40}\n";
                    currentY = yPos + (lineHeight * 3) + 4;
                }
                else if (type === 'audacious') {
                    datosCode += "${goto " + xPos + "}${color " + hexAccent + "}🎵 Audacious:\n";
                    datosCode += "${goto " + xPos + "}${voffset 2}${goto " + (xPos + 10) + "}${color " + hexDisk + "}${execi 2 audtool current-song 2>/dev/null | cut -c1-35}\n";
                    datosCode += "${goto " + xPos + "}${voffset 2}${goto " + (xPos + 10) + "}${color " + hexText + "}${execi 2 audtool current-song-output-length 2>/dev/null} / ${execi 2 audtool current-song-length 2>/dev/null}\n";
                    datosCode += "${goto " + xPos + "}${voffset 2}${goto " + (xPos + 10) + "}${color " + hexRam + "}${execbar 2 aud_len=$(audtool current-song-length-seconds 2>/dev/null || echo 0); if [ \"$aud_len\" -gt 0 ] 2>/dev/null; then expr $(audtool current-song-output-length-seconds 2>/dev/null || echo 0) \\* 100 / $aud_len; else echo 0; fi}${color " + hexText + "}\n";
                    currentY = yPos + (lineHeight * 4) + 6;
                }
                else if (type === 'net') { datosCode += "${goto " + xPos + "}${color " + hexAccent + "}▼${downspeedf " + extra + "}k/s ${color " + hexDisk + "}▲${upspeedf " + extra + "}k/s${color " + hexText + "}\n"; currentY = yPos + lineHeight; }
                else if (type === 'top_cpu') {
                    let col1 = Math.floor(bWidth * 0.55); let col2 = Math.floor(bWidth * 0.85);
                    datosCode += "${goto " + xPos + "}${color " + hexCpu + "}NAME ${goto " + (xPos + col1) + "}   PID ${goto " + (xPos + col2) + "}  CPU%${color " + hexText + "}\n";
                    for(let i=1; i<=5; i++) datosCode += "${goto " + xPos + "}${top name " + i + "} ${goto " + (xPos + col1) + "}${color " + hexAccent + "}${top pid " + i + "}${color " + hexText + "}${goto " + (xPos + col2) + "}${top cpu " + i + "}\n";
                    currentY = yPos + (6 * lineHeight);
                }
                else if (type === 'top_ram') {
                    let col1 = Math.floor(bWidth * 0.55); let col2 = Math.floor(bWidth * 0.85);
                    datosCode += "${goto " + xPos + "}${color " + hexRam + "}NAME ${goto " + (xPos + col1) + "}   PID ${goto " + (xPos + col2) + "}  MEM%${color " + hexText + "}\n";
                    for(let i=1; i<=5; i++) datosCode += "${goto " + xPos + "}${top_mem name " + i + "} ${goto " + (xPos + col1) + "}${color " + hexAccent + "}${top_mem pid " + i + "}${color " + hexText + "}${goto " + (xPos + col2) + "}${top_mem mem " + i + "}\n";
                    currentY = yPos + (6 * lineHeight);
                }
                else if (type === 'graph_cpu') {
                    datosCode += "${goto " + xPos + "}${color " + hexCpu + "}${cpugraph " + bHeight + "," + bWidth + " " + hexCpu + " " + hexTemp + "}${color " + hexText + "}\n";
                    currentY = yPos + bHeight;
                }
                else if (type === 'graph_net') {
                    let gHeight = Math.max(10, Math.floor((bHeight - (lineHeight*2)) / 2));
                    datosCode += "${goto " + xPos + "}${color " + hexAccent + "}▼ Download\n${goto " + xPos + "}${downspeedgraph " + extra + " " + gHeight + "," + bWidth + " " + hexAccent + " " + hexAccent + "}\n${goto " + xPos + "}${color " + hexDisk + "}▲ Upload\n${goto " + xPos + "}${upspeedgraph " + extra + " " + gHeight + "," + bWidth + " " + hexDisk + " " + hexDisk + "}${color " + hexText + "}\n";
                    currentY = yPos + (lineHeight*2) + (gHeight*2);
                }
            }
        }

        let diffToBottom = Math.floor(maxAbsoluteBottom - currentY) + 50;
        if (diffToBottom > 0) datosCode += "${voffset " + diffToBottom + "}\n";
        datosCode += "]]\n";

        // EL SCRIPT DE ARRANQUE BASH
        let bashStart = "#!/bin/bash\n";
        bashStart += "killall conky\n";
        bashStart += "sleep 1\n";
        bashStart += "conky -c ~/.config/conky/conky_anim.conf &\n";
        bashStart += "conky -c ~/.config/conky/conky_datos.conf &\n";
        bashStart += "exit 0\n";

        const downloadFile = function(filename, content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // --- BLOQUE DE LA FORJA REPARADO ---
        document.getElementById('generate-btn').addEventListener('click', function() {

            try {
                // Verificamos si JSZip existe (por si el navegador bloquea la carga)
                if (typeof JSZip === 'undefined') {
                    throw new Error("La librería JSZip no se ha cargado. Revisa la conexión o el archivo local.");
                }

                const zip = new JSZip();

                // IMPORTANTE: Aquí usamos las variables que ya existen en tu script.
                // Si tus variables se llaman distinto (ej: codigoLua en vez de luaCode), cámbialas aquí.
                zip.file("conky_anim.conf", typeof animCode !== 'undefined' ? animCode : "");
                zip.file("conky_datos.conf", typeof datosCode !== 'undefined' ? datosCode : "");
                zip.file("start_conky.sh", typeof bashStart !== 'undefined' ? bashStart : "");
                zip.file("visuals.lua", typeof luaCode !== 'undefined' ? luaCode : "");

                // Para el clima (solo si existe)
                if (typeof bashCode !== 'undefined' && bashCode !== "") {
                    zip.file("weather.sh", bashCode);
                }

                // Generamos el ZIP
                zip.generateAsync({type:"blob"}).then(function(contenidoZip) {
                    const enlaceZip = document.createElement('a');
                    enlaceZip.href = URL.createObjectURL(contenidoZip);
                    enlaceZip.download = "ConkyForge_Tema.zip";
                    document.body.appendChild(enlaceZip);
                    enlaceZip.click();
                    document.body.removeChild(enlaceZip);
                });

            } catch (error) {
                console.error("Fallo crítico en la Forja:", error);
                alert("Atención: " + error.message);
            }

        });
        // --- FIN DEL BLOQUE ---


        if (hasWeatherPro) {
            let bashCode = "#!/bin/bash\n";
            bashCode += 'URL="https://api.open-meteo.com/v1/forecast?latitude=40.45006&longitude=-3.80910&daily=precipitation_sum,daylight_duration,sunset&hourly=temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,weathercode&timezone=Europe%2FBerlin"\n';
            bashCode += 'response=$(curl -s "$URL")\n';
            bashCode += 'if [ -z "$response" ] || [[ "$response" == *"\\"error\\""* ]]; then echo "Error API"; exit 1; fi\n';
            bashCode += 'current_hour=$(date +%-H)\n';
            bashCode += 'temp_max=$(echo "$response" | jq -r ".hourly.temperature_2m[$current_hour] // \\"N/A\\"")\n';
            bashCode += 'temp_min=$(echo "$response" | jq -r ".hourly.apparent_temperature[$current_hour] // \\"N/A\\"")\n';
            bashCode += 'precipitation=$(echo "$response" | jq -r \'.daily.precipitation_sum[0] // "N/A"\')\n';
            bashCode += 'precip_prob=$(echo "$response" | jq -r ".hourly.precipitation_probability[$current_hour] // \\"N/A\\"")\n';
            bashCode += 'wind_speed=$(echo "$response" | jq -r ".hourly.wind_speed_10m[$current_hour] // \\"N/A\\"")\n';
            bashCode += 'humidity=$(echo "$response" | jq -r ".hourly.relative_humidity_2m[$current_hour] // \\"N/A\\"")\n';
            bashCode += 'weather_code=$(echo "$response" | jq -r ".hourly.weathercode[$current_hour] // \\"N/A\\"")\n';
            bashCode += 'sunshine_duration=$(echo "$response" | jq -r ".daily.daylight_duration[0] // \\"N/A\\"")\n';
            bashCode += 'sunset=$(echo "$response" | jq -r ".daily.sunset[0] // \\"N/A\\"" | awk -F\'T\' \'{print substr($2, 1, 5)}\')\n';
            bashCode += 'hours=$(echo "$sunshine_duration / 3600" | bc)\n';
            bashCode += 'minutes=$(echo "($sunshine_duration % 3600) / 60" | bc)\n';
            bashCode += 'get_weather_icon() {\n';
            bashCode += '  case $1 in 0) echo "";; 1) echo "🌤";; 2) echo "";; 3) echo "";; 45|48) echo "🌫️";; 51|53|55) echo "";; 56|57) echo "❄";; 61|63|65) echo "";; 66|67) echo "🌨";; 71|73|75) echo "";; 77) echo "󱋋";; 80|81|82) echo "";; 85|86) echo "🌨";; 95|96|99) echo "⛈";; *) echo "🌡️";; esac\n';
            bashCode += '}\n';
            bashCode += 'get_precip_icon() {\n';
            bashCode += '  if [ "$1" = "N/A" ]; then echo "❓"; elif (( $(echo "$1 < 10" | bc -l) )); then echo " "; elif (( $(echo "$1 < 30" | bc -l) )); then echo ""; elif (( $(echo "$1 < 60" | bc -l) )); then echo ""; else echo ""; fi\n';
            bashCode += '}\n';
            bashCode += 'get_wind_icon() {\n';
            bashCode += '  if [ "$1" = "N/A" ]; then echo "❓"; elif (( $(echo "$1 < 10" | bc -l) )); then echo ""; elif (( $(echo "$1 < 20" | bc -l) )); then echo ""; elif (( $(echo "$1 < 40" | bc -l) )); then echo ""; else echo "🌪️"; fi\n';
            bashCode += '}\n';
            bashCode += 'weather_icon=$(get_weather_icon "$weather_code")\n';
            bashCode += 'precip_icon=$(get_precip_icon "$precip_prob")\n';
            bashCode += 'wind_icon=$(get_wind_icon "$wind_speed")\n';
            bashCode += 'X_POS=${1:-0}\n';
            bashCode += 'echo "\\${goto ${X_POS}}\\${font Hack Nerd Font:size=14}${weather_icon}\\${font Hack Nerd Font:size=9}  Temp.: ${temp_max}°C"\n';
            bashCode += 'echo "\\${goto ${X_POS}}\\${font Hack Nerd Font:size=14}\\${font Hack Nerd Font:size=9}  Sensación: ${temp_min}°C"\n';
            bashCode += 'echo "\\${goto ${X_POS}}\\${font Hack Nerd Font:size=14}${precip_icon} \\${font Hack Nerd Font:size=9} Lluvia: ${precipitation}"\n';
            bashCode += 'echo "\\${goto ${X_POS}}\\${font Hack Nerd Font:size=14} \\${font Hack Nerd Font:size=9} Prob. Lluvia: ${precip_prob}%"\n';
            bashCode += 'echo "\\${goto ${X_POS}}\\${font Hack Nerd Font:size=14}${wind_icon} \\${font Hack Nerd Font:size=9} Viento: ${wind_speed} km/h"\n';
            bashCode += 'echo "\\${goto ${X_POS}}\\${font Hack Nerd Font:size=14} \\${font Hack Nerd Font:size=9} Humedad: ${humidity}%"\n';
            bashCode += 'echo "\\${goto ${X_POS}}\\${font Hack Nerd Font:size=14} \\${font Hack Nerd Font:size=9} Duración día: ${hours}h ${minutes}min"\n';
            bashCode += 'echo "\\${goto ${X_POS}}\\${font Hack Nerd Font:size=14} \\${font Hack Nerd Font:size=9} Sunset: ${sunset}"\n';

            downloadFile('weather.sh', bashCode);
        }

        // GENERACIÓN DEL LUA
        let luaCode = "require 'cairo'\n";
        luaCode += "pcall(require, 'cairo_xlib')\n";
        luaCode += "pcall(require, 'cairo_wayland')\n\n";
        luaCode += "if graph_histories == nil then graph_histories = {} end\n";
        luaCode += "if ticker_states == nil then ticker_states = {} end\n\n";

        luaCode += "function draw_system_ticker(cr, x, y, w, h, t_id, speed, font_name, txt_col, cpu_c, ram_c, tmp_c, acc_c, dsk_c)\n";
        luaCode += "    if ticker_states[t_id] == nil then ticker_states[t_id] = w end\n";
        luaCode += "    local v_cpu = conky_parse('${cpu cpu0}') or '0'\n";
        luaCode += "    local v_ram = conky_parse('${memperc}') or '0'\n";
        luaCode += "    local v_tmp = conky_parse('${hwmon 1 temp 1}') or '0'\n";
        luaCode += "    local v_frq = conky_parse('${freq_g}') or '0'\n";
        luaCode += "    local v_dsk = conky_parse('${fs_used_perc /}') or '0'\n";
        luaCode += "    local v_swp = conky_parse('${swapperc}') or '0'\n";
        luaCode += "    local items = {\n";
        luaCode += "        {lbl='CPU', val=v_cpu..'%', c=cpu_c},\n";
        luaCode += "        {lbl='RAM', val=v_ram..'%', c=ram_c},\n";
        luaCode += "        {lbl='TMP', val=v_tmp..'C', c=tmp_c},\n";
        luaCode += "        {lbl='FRQ', val=v_frq..'G', c=acc_c},\n";
        luaCode += "        {lbl='ROOT', val=v_dsk..'%', c=dsk_c},\n";
        luaCode += "        {lbl='SWAP', val=v_swp..'%', c=ram_c}\n";
        luaCode += "    }\n";
        luaCode += "    cairo_save(cr)\n";
        luaCode += "    cairo_rectangle(cr, x, y, w, h)\n";
        luaCode += "    cairo_clip(cr)\n";
        luaCode += "    cairo_set_source_rgba(cr, 1, 1, 1, 0.05)\n";
        luaCode += "    cairo_paint(cr)\n";
        luaCode += "    cairo_select_font_face(cr, font_name, CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_BOLD)\n";
        luaCode += "    local f_size = h * 0.4\n";
        luaCode += "    if f_size > 20 then f_size = 20 end\n";
        luaCode += "    cairo_set_font_size(cr, f_size)\n";
        luaCode += "    local current_x = x + ticker_states[t_id]\n";
        luaCode += "    local start_y = y + (h/2) + (f_size/3)\n";
        luaCode += "    local total_w = 0\n";
        luaCode += "    local extents = cairo_text_extents_t:create()\n";
        luaCode += "    for loop=1, 2 do\n";
        luaCode += "        local temp_x = current_x\n";
        luaCode += "        for i, itm in ipairs(items) do\n";
        luaCode += "            local str_full = itm.lbl .. ' ' .. itm.val\n";
        luaCode += "            cairo_text_extents(cr, str_full, extents)\n";
        luaCode += "            local box_w = extents.width + 16\n";
        luaCode += "            cairo_set_source_rgba(cr, itm.c[1], itm.c[2], itm.c[3], 0.15)\n";
        luaCode += "            local box_y = y + (h - (f_size + 10)) / 2\n";
        luaCode += "            cairo_rectangle(cr, temp_x, box_y, box_w, f_size + 10)\n";
        luaCode += "            cairo_fill(cr)\n";
        luaCode += "            cairo_set_source_rgba(cr, itm.c[1], itm.c[2], itm.c[3], 0.7)\n";
        luaCode += "            cairo_rectangle(cr, temp_x, box_y, box_w, f_size + 10)\n";
        luaCode += "            cairo_set_line_width(cr, 1)\n";
        luaCode += "            cairo_stroke(cr)\n";
        luaCode += "            cairo_set_source_rgba(cr, itm.c[1], itm.c[2], itm.c[3], 1)\n";
        luaCode += "            cairo_move_to(cr, temp_x + 8, start_y)\n";
        luaCode += "            cairo_show_text(cr, itm.lbl)\n";
        luaCode += "            cairo_text_extents(cr, itm.lbl, extents)\n";
        luaCode += "            cairo_set_source_rgba(cr, txt_col[1], txt_col[2], txt_col[3], 1)\n";
        luaCode += "            cairo_move_to(cr, temp_x + 8 + extents.width + 5, start_y)\n";
        luaCode += "            cairo_show_text(cr, itm.val)\n";
        luaCode += "            temp_x = temp_x + box_w + 15\n";
        luaCode += "        end\n";
        luaCode += "        if loop == 1 then total_w = temp_x - current_x end\n";
        luaCode += "        current_x = current_x + total_w\n";
        luaCode += "    end\n";
        luaCode += "    cairo_restore(cr)\n";
        luaCode += "    ticker_states[t_id] = ticker_states[t_id] - speed\n";
        luaCode += "    if ticker_states[t_id] <= -total_w then ticker_states[t_id] = ticker_states[t_id] + total_w end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_smooth_net_graph(cr, cx, cy, w, h, val_down, val_up, col_down, col_up, graph_id)\n";
        luaCode += "    if graph_histories[graph_id .. '_down'] == nil then\n";
        luaCode += "        graph_histories[graph_id .. '_down'] = {}\n";
        luaCode += "        graph_histories[graph_id .. '_up'] = {}\n";
        luaCode += "        for i = 1, math.floor(w/3) + 2 do\n";
        luaCode += "            table.insert(graph_histories[graph_id .. '_down'], 0)\n";
        luaCode += "            table.insert(graph_histories[graph_id .. '_up'], 0)\n";
        luaCode += "        end\n";
        luaCode += "    end\n\n";
        luaCode += "    local hist_d = graph_histories[graph_id .. '_down']\n";
        luaCode += "    local hist_u = graph_histories[graph_id .. '_up']\n\n";
        luaCode += "    table.insert(hist_d, 1, tonumber(val_down) or 0)\n";
        luaCode += "    table.remove(hist_d)\n";
        luaCode += "    table.insert(hist_u, 1, tonumber(val_up) or 0)\n";
        luaCode += "    table.remove(hist_u)\n\n";
        luaCode += "    local current_max = math.sqrt(2000)\n";
        luaCode += "    for i = 1, #hist_d do\n";
        luaCode += "        local sd = math.sqrt(hist_d[i])\n";
        luaCode += "        local su = math.sqrt(hist_u[i])\n";
        luaCode += "        if sd > current_max then current_max = sd end\n";
        luaCode += "        if su > current_max then current_max = su end\n";
        luaCode += "    end\n\n";
        luaCode += "    local function draw_wave(hist, col)\n";
        luaCode += "        cairo_set_source_rgba(cr, col[1], col[2], col[3], 0.8)\n";
        luaCode += "        cairo_set_line_width(cr, 2)\n";
        luaCode += "        cairo_set_line_join(cr, CAIRO_LINE_JOIN_ROUND)\n";
        luaCode += "        local p_x = cx + w\n";
        luaCode += "        local p_y = cy + h - (math.sqrt(hist[1]) / current_max) * h\n";
        luaCode += "        cairo_move_to(cr, p_x, p_y)\n";
        luaCode += "        for i = 2, #hist do\n";
        luaCode += "            local x = cx + w - ((i-1) * 3)\n";
        luaCode += "            if x < cx then break end\n";
        luaCode += "            local y = cy + h - (math.sqrt(hist[i]) / current_max) * h\n";
        luaCode += "            local cp1x, cp1y = p_x - 1.5, p_y\n";
        luaCode += "            local cp2x, cp2y = x + 1.5, y\n";
        luaCode += "            cairo_curve_to(cr, cp1x, cp1y, cp2x, cp2y, x, y)\n";
        luaCode += "            p_x, p_y = x, y\n";
        luaCode += "        end\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n\n";
        luaCode += "    draw_wave(hist_d, col_down)\n";
        luaCode += "    draw_wave(hist_u, col_up)\n";
        luaCode += "    cairo_select_font_face(cr, 'DejaVu Sans', CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_BOLD)\n";
        luaCode += "    cairo_set_font_size(cr, 11)\n";
        luaCode += "    cairo_set_source_rgba(cr, col_down[1], col_down[2], col_down[3], 1)\n";
        luaCode += "    cairo_move_to(cr, cx + 5, cy + 15)\n";
        luaCode += "    if val_down > 1000 then cairo_show_text(cr, '▼ ' .. string.format('%.1f', val_down/1024) .. ' MB/s') else cairo_show_text(cr, '▼ ' .. string.format('%.0f', val_down) .. ' KB/s') end\n";
        luaCode += "    cairo_set_source_rgba(cr, col_up[1], col_up[2], col_up[3], 1)\n";
        luaCode += "    cairo_move_to(cr, cx + 5, cy + 30)\n";
        luaCode += "    if val_up > 1000 then cairo_show_text(cr, '▲ ' .. string.format('%.1f', val_up/1024) .. ' MB/s') else cairo_show_text(cr, '▲ ' .. string.format('%.0f', val_up) .. ' KB/s') end\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "end\n\n";

        luaCode += "function draw_spinning_globe(cr, cx, cy, radius, speed_x, speed_y, val, color, fill_color)\n";
        luaCode += "    local updates = tonumber(conky_parse('${updates}')) or 0\n";
        luaCode += "    local angle_y = updates * speed_y\n";
        luaCode += "    local angle_x = updates * speed_x\n";
        luaCode += "    local p = val / 100\n";
        luaCode += "    if p > 1 then p = 1 end\n";
        luaCode += "    if p < 0 then p = 0 end\n";
        luaCode += "    local fill_y = (cy + radius) - (p * 2 * radius)\n";
        luaCode += "    cairo_arc(cr, cx, cy, radius, 0, 2*math.pi)\n";
        luaCode += "    cairo_set_source_rgba(cr, color[1], color[2], color[3], 0.05)\n";
        luaCode += "    cairo_fill(cr)\n";
        luaCode += "    if p > 0 then\n";
        luaCode += "        cairo_save(cr)\n";
        luaCode += "        cairo_rectangle(cr, cx - radius - 5, fill_y, (radius * 2) + 10, (radius * 2) + 10)\n";
        luaCode += "        cairo_clip(cr)\n";
        luaCode += "        cairo_arc(cr, cx, cy, radius, 0, 2*math.pi)\n";
        luaCode += "        cairo_set_source_rgba(cr, fill_color[1], fill_color[2], fill_color[3], 0.15)\n";
        luaCode += "        cairo_fill(cr)\n";
        luaCode += "        cairo_restore(cr)\n";
        luaCode += "    end\n";
        luaCode += "    cairo_arc(cr, cx, cy, radius, 0, 2*math.pi)\n";
        luaCode += "    cairo_set_source_rgba(cr, color[1], color[2], color[3], 0.3)\n";
        luaCode += "    cairo_set_line_width(cr, 1)\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    local function project(lat, lon)\n";
        luaCode += "        local x = math.cos(lat) * math.cos(lon)\n";
        luaCode += "        local y = math.sin(lat)\n";
        luaCode += "        local z = math.cos(lat) * math.sin(lon)\n";
        luaCode += "        local y1 = y * math.cos(angle_x) - z * math.sin(angle_x)\n";
        luaCode += "        local z1 = y * math.sin(angle_x) + z * math.cos(angle_x)\n";
        luaCode += "        y = y1; z = z1\n";
        luaCode += "        local x2 = x * math.cos(angle_y) + z * math.sin(angle_y)\n";
        luaCode += "        local z2 = -x * math.sin(angle_y) + z * math.cos(angle_y)\n";
        luaCode += "        x = x2; z = z2\n";
        luaCode += "        return cx + x * radius, cy + y * radius, z\n";
        luaCode += "    end\n";
        luaCode += "    local function draw_wireframe(col, alpha)\n";
        luaCode += "        cairo_set_source_rgba(cr, col[1], col[2], col[3], alpha)\n";
        luaCode += "        for lat = -math.pi/2 + 0.3, math.pi/2 - 0.3, 0.3 do\n";
        luaCode += "            local prev_x, prev_y, prev_z\n";
        luaCode += "            for lon = 0, 2*math.pi + 0.1, 0.2 do\n";
        luaCode += "                local px, py, pz = project(lat, lon)\n";
        luaCode += "                if pz > 0 then\n";
        luaCode += "                    if prev_z and prev_z > 0 then\n";
        luaCode += "                        cairo_move_to(cr, prev_x, prev_y)\n";
        luaCode += "                        cairo_line_to(cr, px, py)\n";
        luaCode += "                        cairo_stroke(cr)\n";
        luaCode += "                    end\n";
        luaCode += "                end\n";
        luaCode += "                prev_x, prev_y, prev_z = px, py, pz\n";
        luaCode += "            end\n";
        luaCode += "        end\n";
        luaCode += "        for lon = 0, 2*math.pi, math.pi/6 do\n";
        luaCode += "            local prev_x, prev_y, prev_z\n";
        luaCode += "            for lat = -math.pi/2, math.pi/2 + 0.1, 0.1 do\n";
        luaCode += "                local px, py, pz = project(lat, lon)\n";
        luaCode += "                if pz > 0 then\n";
        luaCode += "                    if prev_z and prev_z > 0 then\n";
        luaCode += "                        cairo_move_to(cr, prev_x, prev_y)\n";
        luaCode += "                        cairo_line_to(cr, px, py)\n";
        luaCode += "                        cairo_stroke(cr)\n";
        luaCode += "                    end\n";
        luaCode += "                end\n";
        luaCode += "                prev_x, prev_y, prev_z = px, py, pz\n";
        luaCode += "            end\n";
        luaCode += "        end\n";
        luaCode += "    end\n";
        luaCode += "    draw_wireframe(color, 0.8)\n";
        luaCode += "    if p > 0 then\n";
        luaCode += "        cairo_save(cr)\n";
        luaCode += "        cairo_rectangle(cr, cx - radius - 5, fill_y, (radius * 2) + 10, (radius * 2) + 10)\n";
        luaCode += "        cairo_clip(cr)\n";
        luaCode += "        draw_wireframe(fill_color, 1.0)\n";
        luaCode += "        cairo_restore(cr)\n";
        luaCode += "    end\n";
        luaCode += "    cairo_select_font_face(cr, 'DejaVu Sans', CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_BOLD)\n";
        luaCode += "    cairo_set_font_size(cr, 11)\n";
        luaCode += "    local val_str = 'RAM ' .. tostring(math.floor(p * 100)) .. '%'\n";
        luaCode += "    local extents = cairo_text_extents_t:create()\n";
        luaCode += "    cairo_text_extents(cr, val_str, extents)\n";
        luaCode += "    cairo_move_to(cr, cx - (extents.width/2), cy + radius + 15)\n";
        luaCode += "    cairo_set_source_rgba(cr, fill_color[1], fill_color[2], fill_color[3], 1)\n";
        luaCode += "    cairo_show_text(cr, val_str)\n";
        luaCode += "end\n\n";

        luaCode += "function draw_neon_line(cr, x1, y1, x2, y2, thickness, r, g, b)\n";
        luaCode += "    cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND)\n";
        luaCode += "    cairo_set_source_rgba(cr, r, g, b, 0.2)\n";
        luaCode += "    cairo_set_line_width(cr, thickness * 4)\n";
        luaCode += "    cairo_move_to(cr, x1, y1) cairo_line_to(cr, x2, y2) cairo_stroke(cr)\n";
        luaCode += "    cairo_set_source_rgba(cr, r, g, b, 0.5)\n";
        luaCode += "    cairo_set_line_width(cr, thickness * 2)\n";
        luaCode += "    cairo_move_to(cr, x1, y1) cairo_line_to(cr, x2, y2) cairo_stroke(cr)\n";
        luaCode += "    local core = thickness * 0.4\n";
        luaCode += "    if core < 1 then core = 1 end\n";
        luaCode += "    cairo_set_source_rgba(cr, 1, 1, 1, 0.9)\n";
        luaCode += "    cairo_set_line_width(cr, core)\n";
        luaCode += "    cairo_move_to(cr, x1, y1) cairo_line_to(cr, x2, y2) cairo_stroke(cr)\n";
        luaCode += "end\n\n";

        luaCode += "function draw_neon_circle(cr, cx, cy, radius, thickness, r, g, b)\n";
        luaCode += "    cairo_set_source_rgba(cr, r, g, b, 0.2)\n";
        luaCode += "    cairo_set_line_width(cr, thickness * 4)\n";
        luaCode += "    cairo_arc(cr, cx, cy, radius, 0, 2 * math.pi) cairo_stroke(cr)\n";
        luaCode += "    cairo_set_source_rgba(cr, r, g, b, 0.5)\n";
        luaCode += "    cairo_set_line_width(cr, thickness * 2)\n";
        luaCode += "    cairo_arc(cr, cx, cy, radius, 0, 2 * math.pi) cairo_stroke(cr)\n";
        luaCode += "    local core = thickness * 0.4\n";
        luaCode += "    if core < 1 then core = 1 end\n";
        luaCode += "    cairo_set_source_rgba(cr, 1, 1, 1, 0.9)\n";
        luaCode += "    cairo_set_line_width(cr, core)\n";
        luaCode += "    cairo_arc(cr, cx, cy, radius, 0, 2 * math.pi) cairo_stroke(cr)\n";
        luaCode += "end\n\n";

        luaCode += "function draw_disk_bar(cr, x, y, w, h, path, label, color, txt_color, thickness)\n";
        luaCode += "    local perc_str = conky_parse('${fs_used_perc ' .. path .. '}')\n";
        luaCode += "    local perc = tonumber(perc_str) or 0\n";
        luaCode += "    local used = conky_parse('${fs_used ' .. path .. '}')\n";
        luaCode += "    local size = conky_parse('${fs_size ' .. path .. '}')\n";
        luaCode += "    cairo_select_font_face(cr, '" + userFont + "', CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_BOLD)\n";
        luaCode += "    cairo_set_font_size(cr, 12)\n";
        luaCode += "    cairo_set_source_rgba(cr, txt_color[1], txt_color[2], txt_color[3], 1)\n";
        luaCode += "    cairo_move_to(cr, x, y + 12)\n";
        luaCode += "    cairo_show_text(cr, label)\n";
        luaCode += "    local right_text = used .. ' / ' .. size\n";
        luaCode += "    local extents = cairo_text_extents_t:create()\n";
        luaCode += "    cairo_text_extents(cr, right_text, extents)\n";
        luaCode += "    cairo_move_to(cr, x + w - extents.width, y + 12)\n";
        luaCode += "    cairo_show_text(cr, right_text)\n";
        luaCode += "    local bar_h = thickness\n";
        luaCode += "    if bar_h < 2 then bar_h = 2 end\n";
        luaCode += "    local bar_y = y + 25\n";
        luaCode += "    local radius = bar_h / 2\n";
        luaCode += "    cairo_set_line_width(cr, bar_h)\n";
        luaCode += "    cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND)\n";
        luaCode += "    cairo_set_source_rgba(cr, 1, 1, 1, 0.1)\n";
        luaCode += "    cairo_move_to(cr, x + radius, bar_y + radius)\n";
        luaCode += "    cairo_line_to(cr, x + w - radius, bar_y + radius)\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    if perc > 0 then\n";
        luaCode += "        local ratio = perc / 100\n";
        luaCode += "        local fill_w = w * ratio\n";
        luaCode += "        if fill_w < bar_h then fill_w = bar_h end\n";
        luaCode += "        local r, g, b = color[1], color[2], color[3]\n";
        luaCode += "        if perc >= 85 then r = 1.0; g = 0.2; b = 0.2 end\n";
        luaCode += "        cairo_set_source_rgba(cr, r, g, b, 1)\n";
        luaCode += "        cairo_move_to(cr, x + radius, bar_y + radius)\n";
        luaCode += "        cairo_line_to(cr, x + fill_w - radius, bar_y + radius)\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_horizontal_text_spaced(cr, x, y, text, font_size, r, g, b, spacing)\n";
        luaCode += "    cairo_select_font_face(cr, '" + userFont + "', CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_BOLD)\n";
        luaCode += "    cairo_set_font_size(cr, font_size)\n";
        luaCode += "    cairo_set_source_rgb(cr, r, g, b)\n";
        luaCode += "    local chars = {}\n";
        luaCode += "    local p = 1\n";
        luaCode += "    while p <= string.len(text) do\n";
        luaCode += "        local c = string.byte(text, p)\n";
        luaCode += "        local shift = 1\n";
        luaCode += "        if c > 0 and c <= 127 then shift = 1\n";
        luaCode += "        elseif c >= 192 and c <= 223 then shift = 2\n";
        luaCode += "        elseif c >= 224 and c <= 239 then shift = 3\n";
        luaCode += "        elseif c >= 240 and c <= 247 then shift = 4 end\n";
        luaCode += "        table.insert(chars, string.sub(text, p, p + shift - 1))\n";
        luaCode += "        p = p + shift\n";
        luaCode += "    end\n";
        luaCode += "    local total_width = 0\n";
        luaCode += "    local extents = cairo_text_extents_t:create()\n";
        luaCode += "    for _, char in ipairs(chars) do\n";
        luaCode += "        cairo_text_extents(cr, char, extents)\n";
        luaCode += "        total_width = total_width + extents.x_advance\n";
        luaCode += "    end\n";
        luaCode += "    total_width = total_width + (#chars - 1) * spacing\n";
        luaCode += "    cairo_text_extents(cr, 'A', extents)\n";
        luaCode += "    local current_x = x - (total_width / 2)\n";
        luaCode += "    local current_y = y - (extents.height / 2 + extents.y_bearing)\n";
        luaCode += "    for _, char in ipairs(chars) do\n";
        luaCode += "        cairo_move_to(cr, current_x, current_y)\n";
        luaCode += "        cairo_show_text(cr, char)\n";
        luaCode += "        cairo_text_extents(cr, char, extents)\n";
        luaCode += "        current_x = current_x + extents.x_advance + spacing\n";
        luaCode += "    end\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "end\n\n";

        luaCode += "function draw_stacked_vertical_text(cr, box_x, box_y, box_w, box_h, text, font_size, r, g, b, spacing)\n";
        luaCode += "    cairo_select_font_face(cr, '" + userFont + "', CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_BOLD)\n";
        luaCode += "    cairo_set_font_size(cr, font_size)\n";
        luaCode += "    cairo_set_source_rgb(cr, r, g, b)\n";
        luaCode += "    local chars = {}\n";
        luaCode += "    local p = 1\n";
        luaCode += "    while p <= string.len(text) do\n";
        luaCode += "        local c = string.byte(text, p)\n";
        luaCode += "        local shift = 1\n";
        luaCode += "        if c > 0 and c <= 127 then shift = 1\n";
        luaCode += "        elseif c >= 192 and c <= 223 then shift = 2\n";
        luaCode += "        elseif c >= 224 and c <= 239 then shift = 3\n";
        luaCode += "        elseif c >= 240 and c <= 247 then shift = 4 end\n";
        luaCode += "        table.insert(chars, string.sub(text, p, p + shift - 1))\n";
        luaCode += "        p = p + shift\n";
        luaCode += "    end\n";
        luaCode += "    local len = #chars\n";
        luaCode += "    if len == 0 then return end\n";
        luaCode += "    local step = 0\n";
        luaCode += "    if len > 1 then step = (box_h - font_size) / (len - 1) + spacing end\n";
        luaCode += "    for i, char in ipairs(chars) do\n";
        luaCode += "        local extents = cairo_text_extents_t:create()\n";
        luaCode += "        cairo_text_extents(cr, char, extents)\n";
        luaCode += "        local char_x = box_x + (box_w / 2) - (extents.width / 2 + extents.x_bearing)\n";
        luaCode += "        local char_y = box_y + ((i-1) * step) + font_size - (font_size * 0.1)\n";
        luaCode += "        cairo_move_to(cr, char_x, char_y)\n";
        luaCode += "        cairo_show_text(cr, char)\n";
        luaCode += "    end\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "end\n\n";

        luaCode += "function draw_image_base(cr, x, y, w, h, path)\n";
        luaCode += "    local image = cairo_image_surface_create_from_png(path)\n";
        luaCode += "    if cairo_surface_status(image) == CAIRO_STATUS_SUCCESS then\n";
        luaCode += "        local img_w = cairo_image_surface_get_width(image)\n";
        luaCode += "        local img_h = cairo_image_surface_get_height(image)\n";
        luaCode += "        cairo_save(cr)\n";
        luaCode += "        cairo_translate(cr, x, y)\n";
        luaCode += "        cairo_scale(cr, w / img_w, h / img_h)\n";
        luaCode += "        cairo_set_source_surface(cr, image, 0, 0)\n";
        luaCode += "        cairo_paint(cr)\n";
        luaCode += "        cairo_restore(cr)\n";
        luaCode += "        cairo_surface_destroy(image)\n";
        luaCode += "    else\n";
        luaCode += "        draw_horizontal_text_spaced(cr, x + w/2, y + h/2, 'PNG ERROR', 12, 1, 0, 0, 0)\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_analog_clock(cr, x, y, radius, bg_rgb, fg_rgb, ac_rgb)\n";
        luaCode += "    local time_h = tonumber(os.date('%I')) or 0\n";
        luaCode += "    local time_m = tonumber(os.date('%M')) or 0\n";
        luaCode += "    local time_s = tonumber(os.date('%S')) or 0\n";
        luaCode += "    cairo_arc(cr, x, y, radius, 0, 2*math.pi)\n";
        luaCode += "    cairo_set_source_rgba(cr, bg_rgb[1], bg_rgb[2], bg_rgb[3], 0.1)\n";
        luaCode += "    cairo_fill(cr)\n";
        luaCode += "    cairo_set_source_rgba(cr, bg_rgb[1], bg_rgb[2], bg_rgb[3], 0.5)\n";
        luaCode += "    cairo_set_line_width(cr, 2)\n";
        luaCode += "    for i=1,12 do\n";
        luaCode += "        cairo_move_to(cr, x + math.sin(math.pi/6 * i) * (radius*0.85), y - math.cos(math.pi/6 * i) * (radius*0.85))\n";
        luaCode += "        cairo_line_to(cr, x + math.sin(math.pi/6 * i) * radius, y - math.cos(math.pi/6 * i) * radius)\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n";
        luaCode += "    local h_angle = (time_h * 30 + time_m / 2) * math.pi / 180\n";
        luaCode += "    cairo_set_source_rgba(cr, fg_rgb[1], fg_rgb[2], fg_rgb[3], 1.0)\n";
        luaCode += "    cairo_set_line_width(cr, 4)\n";
        luaCode += "    cairo_move_to(cr, x, y)\n";
        luaCode += "    cairo_line_to(cr, x + math.sin(h_angle) * (radius*0.5), y - math.cos(h_angle) * (radius*0.5))\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    local m_angle = (time_m * 6 + time_s / 10) * math.pi / 180\n";
        luaCode += "    cairo_set_line_width(cr, 2)\n";
        luaCode += "    cairo_move_to(cr, x, y)\n";
        luaCode += "    cairo_line_to(cr, x + math.sin(m_angle) * (radius*0.8), y - math.cos(m_angle) * (radius*0.8))\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    local s_angle = time_s * 6 * math.pi / 180\n";
        luaCode += "    cairo_set_source_rgba(cr, ac_rgb[1], ac_rgb[2], ac_rgb[3], 1.0)\n";
        luaCode += "    cairo_set_line_width(cr, 1)\n";
        luaCode += "    cairo_move_to(cr, x, y)\n";
        luaCode += "    cairo_line_to(cr, x + math.sin(s_angle) * (radius*0.9), y - math.cos(s_angle) * (radius*0.9))\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    cairo_arc(cr, x, y, 3, 0, 2*math.pi)\n";
        luaCode += "    cairo_fill(cr)\n";
        luaCode += "end\n\n";

        luaCode += "function draw_ring(cr, t, pt, raw_val, label)\n";
        luaCode += "    local angle_0 = t.start_angle * (math.pi/180) - (math.pi/2)\n";
        luaCode += "    local angle_f = t.end_angle * (math.pi/180) - (math.pi/2)\n";
        luaCode += "    local t_arc = pt * (angle_f - angle_0)\n";
        luaCode += "    cairo_arc(cr, t.x, t.y, t.radius, angle_0, angle_f)\n";
        luaCode += "    cairo_set_source_rgba(cr, t.bgc[1], t.bgc[2], t.bgc[3], t.bga)\n";
        luaCode += "    cairo_set_line_width(cr, t.thickness)\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    if pt > 0 then\n";
        luaCode += "        local r = t.fgc[1]; local g = t.fgc[2]; local b = t.fgc[3]\n";
        luaCode += "        if pt >= 0.80 then r = 1.0; g = 0.2; b = 0.2 end\n";
        luaCode += "        cairo_arc(cr, t.x, t.y, t.radius, angle_0, angle_0 + t_arc)\n";
        luaCode += "        cairo_set_source_rgba(cr, r, g, b, t.fga)\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "        local val_text = string.format('%d%%', raw_val)\n";
        luaCode += "        draw_horizontal_text_spaced(cr, t.x, t.y - t.scale_offset, val_text, t.font_val, r, g, b, 0)\n";
        luaCode += "    else\n";
        luaCode += "        local val_text = string.format('0%%')\n";
        luaCode += "        draw_horizontal_text_spaced(cr, t.x, t.y - t.scale_offset, val_text, t.font_val, t.fgc[1], t.fgc[2], t.fgc[3], 0)\n";
        luaCode += "    end\n";
        luaCode += "    draw_horizontal_text_spaced(cr, t.x, t.y + t.scale_offset * 2.5, label, t.font_lbl, 1, 1, 1, 0)\n";
        luaCode += "end\n\n";

        luaCode += "function draw_concentric_gpu(cr, x, y, radius, thickness, temp_val, mem_val, label, txt_rgb, tmp_rgb, mem_rgb)\n";
        luaCode += "    local start_a = 135 * (math.pi/180)\n";
        luaCode += "    local end_a = 405 * (math.pi/180)\n";
        luaCode += "    local span = end_a - start_a\n\n";
        luaCode += "    cairo_arc(cr, x, y, radius, start_a, end_a)\n";
        luaCode += "    cairo_set_source_rgba(cr, 1, 1, 1, 0.1)\n";
        luaCode += "    cairo_set_line_width(cr, thickness)\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    local t_pt = math.min(temp_val / 100, 1)\n";
        luaCode += "    if t_pt > 0 then\n";
        luaCode += "        cairo_arc(cr, x, y, radius, start_a, start_a + (span * t_pt))\n";
        luaCode += "        cairo_set_source_rgba(cr, tmp_rgb[1], tmp_rgb[2], tmp_rgb[3], 1)\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n\n";
        luaCode += "    local in_rad = radius - thickness - 4\n";
        luaCode += "    cairo_arc(cr, x, y, in_rad, start_a, end_a)\n";
        luaCode += "    cairo_set_source_rgba(cr, 1, 1, 1, 0.1)\n";
        luaCode += "    cairo_set_line_width(cr, thickness)\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    local m_pt = math.min(mem_val / 100, 1)\n";
        luaCode += "    if m_pt > 0 then\n";
        luaCode += "        cairo_arc(cr, x, y, in_rad, start_a, start_a + (span * m_pt))\n";
        luaCode += "        cairo_set_source_rgba(cr, mem_rgb[1], mem_rgb[2], mem_rgb[3], 1)\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n\n";
        luaCode += "    draw_horizontal_text_spaced(cr, x, y - 8, label, 16, txt_rgb[1], txt_rgb[2], txt_rgb[3], 0)\n";
        luaCode += "    draw_horizontal_text_spaced(cr, x, y + 8, temp_val .. '°C', 10, tmp_rgb[1], tmp_rgb[2], tmp_rgb[3], 0)\n";
        luaCode += "    draw_horizontal_text_spaced(cr, x, y + 20, mem_val .. '%', 10, mem_rgb[1], mem_rgb[2], mem_rgb[3], 0)\n";
        luaCode += "end\n\n";

        luaCode += "function draw_eq_vertical(cr, x, y, w, h, count, base_rgb)\n";
        luaCode += "    local space = 2\n";
        luaCode += "    local bar_w = (w / count) - space\n";
        luaCode += "    for i=1, count do\n";
        luaCode += "        local val = tonumber(conky_parse('${cpu cpu'..i..'}')) or 0\n";
        luaCode += "        local p = val / 100\n";
        luaCode += "        local display_p = math.sqrt(p)\n";
        luaCode += "        local bar_h = display_p * h\n";
        luaCode += "        cairo_rectangle(cr, x + (i-1)*(bar_w+space), y, bar_w, h)\n";
        luaCode += "        cairo_set_source_rgba(cr, 1, 1, 1, 0.05)\n";
        luaCode += "        cairo_fill(cr)\n";
        luaCode += "        local r = base_rgb[1]; local g = base_rgb[2]; local b = base_rgb[3]\n";
        luaCode += "        if p >= 0.85 then r = 1.0; g = 0.2; b = 0.2 end\n";
        luaCode += "        cairo_rectangle(cr, x + (i-1)*(bar_w+space), y + h - bar_h, bar_w, bar_h)\n";
        luaCode += "        cairo_set_source_rgba(cr, r, g, b, 0.9)\n";
        luaCode += "        cairo_fill(cr)\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_eq_horizontal(cr, x, y, w, h, count, base_rgb)\n";
        luaCode += "    local space = 2\n";
        luaCode += "    local bar_h = (h / count) - space\n";
        luaCode += "    for i=1, count do\n";
        luaCode += "        local val = tonumber(conky_parse('${cpu cpu'..i..'}')) or 0\n";
        luaCode += "        local p = val / 100\n";
        luaCode += "        local display_p = math.sqrt(p)\n";
        luaCode += "        local bar_w = display_p * w\n";
        luaCode += "        cairo_rectangle(cr, x, y + (i-1)*(bar_h+space), w, bar_h)\n";
        luaCode += "        cairo_set_source_rgba(cr, 1, 1, 1, 0.05)\n";
        luaCode += "        cairo_fill(cr)\n";
        luaCode += "        local r = base_rgb[1]; local g = base_rgb[2]; local b = base_rgb[3]\n";
        luaCode += "        if p >= 0.85 then r = 1.0; g = 0.2; b = 0.2 end\n";
        luaCode += "        cairo_rectangle(cr, x, y + (i-1)*(bar_h+space), bar_w, bar_h)\n";
        luaCode += "        cairo_set_source_rgba(cr, r, g, b, 0.9)\n";
        luaCode += "        cairo_fill(cr)\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_eq_circular(cr, cx, cy, radius, count, base_rgb)\n";
        luaCode += "    local inner_r = radius * 0.4\n";
        luaCode += "    local outer_r = radius\n";
        luaCode += "    local angle_step = (2 * math.pi) / count\n";
        luaCode += "    cairo_set_line_width(cr, 3)\n";
        luaCode += "    cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND)\n";
        luaCode += "    for i=1, count do\n";
        luaCode += "        local val = tonumber(conky_parse('${cpu cpu'..i..'}')) or 0\n";
        luaCode += "        local p = val / 100\n";
        luaCode += "        local display_p = math.sqrt(p)\n";
        luaCode += "        local current_r = inner_r + (outer_r - inner_r) * display_p\n";
        luaCode += "        local angle = (i-1) * angle_step - (math.pi/2)\n";
        luaCode += "        cairo_set_source_rgba(cr, 1, 1, 1, 0.05)\n";
        luaCode += "        cairo_move_to(cr, cx + inner_r * math.cos(angle), cy + inner_r * math.sin(angle))\n";
        luaCode += "        cairo_line_to(cr, cx + outer_r * math.cos(angle), cy + outer_r * math.sin(angle))\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "        local r = base_rgb[1]; local g = base_rgb[2]; local b = base_rgb[3]\n";
        luaCode += "        if p >= 0.85 then r = 1.0; g = 0.2; b = 0.2 end\n";
        luaCode += "        cairo_set_source_rgba(cr, r, g, b, 0.9)\n";
        luaCode += "        cairo_move_to(cr, cx + inner_r * math.cos(angle), cy + inner_r * math.sin(angle))\n";
        luaCode += "        cairo_line_to(cr, cx + current_r * math.cos(angle), cy + current_r * math.sin(angle))\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_eq_circular_open(cr, cx, cy, radius, count, col_start, col_end)\n";
        luaCode += "    local inner_r = radius * 0.4\n";
        luaCode += "    local outer_r = radius\n";
        luaCode += "    local start_angle = 135 * (math.pi / 180)\n";
        luaCode += "    local end_angle = 405 * (math.pi / 180)\n";
        luaCode += "    local span = end_angle - start_angle\n";
        luaCode += "    local angle_step = count > 1 and (span / (count - 1)) or 0\n";
        luaCode += "    cairo_set_line_width(cr, 3)\n";
        luaCode += "    cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND)\n";
        luaCode += "    for i=1, count do\n";
        luaCode += "        local val = tonumber(conky_parse('${cpu cpu'..i..'}')) or 0\n";
        luaCode += "        local p = val / 100\n";
        luaCode += "        local display_p = math.sqrt(p)\n";
        luaCode += "        local current_r = inner_r + (outer_r - inner_r) * display_p\n";
        luaCode += "        local angle = start_angle + (i-1) * angle_step\n";
        luaCode += "        cairo_set_source_rgba(cr, 1, 1, 1, 0.05)\n";
        luaCode += "        cairo_move_to(cr, cx + inner_r * math.cos(angle), cy + inner_r * math.sin(angle))\n";
        luaCode += "        cairo_line_to(cr, cx + outer_r * math.cos(angle), cy + outer_r * math.sin(angle))\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "        local ratio = count > 1 and (i - 1) / (count - 1) or 0\n";
        luaCode += "        local r = col_start[1] * (1 - ratio) + col_end[1] * ratio\n";
        luaCode += "        local g = col_start[2] * (1 - ratio) + col_end[2] * ratio\n";
        luaCode += "        local b = col_start[3] * (1 - ratio) + col_end[3] * ratio\n";
        luaCode += "        if p >= 0.85 then r = 1.0; g = 0.2; b = 0.2 end\n";
        luaCode += "        cairo_set_source_rgba(cr, r, g, b, 0.9)\n";
        luaCode += "        cairo_move_to(cr, cx + inner_r * math.cos(angle), cy + inner_r * math.sin(angle))\n";
        luaCode += "        cairo_line_to(cr, cx + current_r * math.cos(angle), cy + current_r * math.sin(angle))\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_eq_concentric(cr, cx, cy, radius, count, base_rgb)\n";
        luaCode += "    local thickness = (radius * 0.8) / count\n";
        luaCode += "    local start_angle = math.pi\n";
        luaCode += "    local max_sweep = 1.5 * math.pi\n";
        luaCode += "    cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND)\n";
        luaCode += "    for i=1, count do\n";
        luaCode += "        local val = tonumber(conky_parse('${cpu cpu'..i..'}')) or 0\n";
        luaCode += "        local p = val / 100\n";
        luaCode += "        local display_p = math.sqrt(p)\n";
        luaCode += "        local current_r = radius - (i-1)*(thickness + 2)\n";
        luaCode += "        if current_r < 5 then break end\n";
        luaCode += "        cairo_set_line_width(cr, thickness)\n";
        luaCode += "        cairo_set_source_rgba(cr, 1, 1, 1, 0.05)\n";
        luaCode += "        cairo_arc(cr, cx, cy, current_r, start_angle, start_angle + max_sweep)\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "        if display_p > 0 then\n";
        luaCode += "            local r = base_rgb[1]; local g = base_rgb[2]; local b = base_rgb[3]\n";
        luaCode += "            if p >= 0.85 then r = 1.0; g = 0.2; b = 0.2 end\n";
        luaCode += "            cairo_set_source_rgba(cr, r, g, b, 0.9)\n";
        luaCode += "            cairo_arc(cr, cx, cy, current_r, start_angle, start_angle + (max_sweep * display_p))\n";
        luaCode += "            cairo_stroke(cr)\n";
        luaCode += "        end\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_eq_concentric_open(cr, cx, cy, radius, count, base_rgb)\n";
        luaCode += "    local thickness = (radius * 0.8) / count\n";
        luaCode += "    local start_angle = 135 * (math.pi / 180)\n";
        luaCode += "    local max_sweep = 270 * (math.pi / 180)\n";
        luaCode += "    cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND)\n";
        luaCode += "    for i=1, count do\n";
        luaCode += "        local val = tonumber(conky_parse('${cpu cpu'..i..'}')) or 0\n";
        luaCode += "        local p = val / 100\n";
        luaCode += "        local display_p = math.sqrt(p)\n";
        luaCode += "        local current_r = radius - (i-1)*(thickness + 2)\n";
        luaCode += "        if current_r < 5 then break end\n";
        luaCode += "        cairo_set_line_width(cr, thickness)\n";
        luaCode += "        cairo_set_source_rgba(cr, 1, 1, 1, 0.05)\n";
        luaCode += "        cairo_arc(cr, cx, cy, current_r, start_angle, start_angle + max_sweep)\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "        if display_p > 0 then\n";
        luaCode += "            local r = base_rgb[1]; local g = base_rgb[2]; local b = base_rgb[3]\n";
        luaCode += "            if p >= 0.85 then r = 1.0; g = 0.2; b = 0.2 end\n";
        luaCode += "            cairo_set_source_rgba(cr, r, g, b, 0.9)\n";
        luaCode += "            cairo_arc(cr, cx, cy, current_r, start_angle, start_angle + (max_sweep * display_p))\n";
        luaCode += "            cairo_stroke(cr)\n";
        luaCode += "        end\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_spiral_inverse(cr, cx, cy, max_r, val, max_val, color, thickness)\n";
        luaCode += "    local p = (tonumber(val) or 0) / max_val\n";
        luaCode += "    if p > 1 then p = 1 end; if p < 0 then p = 0 end\n";
        luaCode += "    local display_p = math.sqrt(p)\n";
        luaCode += "    local r_col = color[1]; local g_col = color[2]; local b_col = color[3]\n";
        luaCode += "    if p > 0.85 then r_col = 1.0; g_col = 0.2; b_col = 0.2 end\n";
        luaCode += "    local max_turns = 3.5\n";
        luaCode += "    local max_theta = max_turns * 2 * math.pi\n";
        luaCode += "    cairo_set_line_width(cr, thickness)\n";
        luaCode += "    cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND)\n";
        luaCode += "    cairo_set_source_rgba(cr, color[1], color[2], color[3], 0.15)\n";
        luaCode += "    local started = false\n";
        luaCode += "    for theta = 0, max_theta, 0.05 do\n";
        luaCode += "        local r = max_r - (max_r / max_theta) * theta\n";
        luaCode += "        local x = cx + r * math.cos(theta)\n";
        luaCode += "        local y = cy + r * math.sin(theta)\n";
        luaCode += "        if not started then cairo_move_to(cr, x, y); started = true\n";
        luaCode += "        else cairo_line_to(cr, x, y) end\n";
        luaCode += "    end\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    if display_p > 0 then\n";
        luaCode += "        cairo_set_source_rgba(cr, r_col, g_col, b_col, 1)\n";
        luaCode += "        started = false\n";
        luaCode += "        for theta = 0, max_theta * display_p, 0.05 do\n";
        luaCode += "            local r = max_r - (max_r / max_theta) * theta\n";
        luaCode += "            local x = cx + r * math.cos(theta)\n";
        luaCode += "            local y = cy + r * math.sin(theta)\n";
        luaCode += "            if not started then cairo_move_to(cr, x, y); started = true\n";
        luaCode += "            else cairo_line_to(cr, x, y) end\n";
        luaCode += "        end\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function draw_spiral_dna(cr, cx, cy, w, h, val1, val2, max_val, col1, col2, thickness)\n";
        luaCode += "    local p1 = (tonumber(val1) or 0) / max_val\n";
        luaCode += "    if p1 > 1 then p1 = 1 end; if p1 < 0 then p1 = 0 end\n";
        luaCode += "    local display_p1 = math.sqrt(p1)\n";
        luaCode += "    local r1 = col1[1]; local g1 = col1[2]; local b1 = col1[3]\n";
        luaCode += "    if p1 > 0.85 then r1 = 1.0; g1 = 0.2; b1 = 0.2 end\n";
        luaCode += "    local p2 = (tonumber(val2) or 0) / max_val\n";
        luaCode += "    if p2 > 1 then p2 = 1 end; if p2 < 0 then p2 = 0 end\n";
        luaCode += "    local display_p2 = math.sqrt(p2)\n";
        luaCode += "    local r2 = col2[1]; local g2 = col2[2]; local b2 = col2[3]\n";
        luaCode += "    if p2 > 0.85 then r2 = 1.0; g2 = 0.2; b2 = 0.2 end\n";
        luaCode += "    local cycles = 3.5\n";
        luaCode += "    local amplitude = (w / 2) * 0.75\n";
        luaCode += "    local start_y = cy + (h / 2) - thickness\n";
        luaCode += "    local end_y = cy - (h / 2) + thickness\n";
        luaCode += "    local offset = math.pi / 2\n";
        luaCode += "    cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND)\n";
        luaCode += "    cairo_set_line_join(cr, CAIRO_LINE_JOIN_ROUND)\n";
        luaCode += "    cairo_set_source_rgba(cr, 1, 1, 1, 0.08)\n";
        luaCode += "    cairo_set_line_width(cr, thickness * 0.5)\n";
        luaCode += "    for t = 0, 1, 0.035 do\n";
        luaCode += "        local y = start_y + t * (end_y - start_y)\n";
        luaCode += "        local angle = t * cycles * 2 * math.pi + offset\n";
        luaCode += "        local x1 = cx + amplitude * math.sin(angle)\n";
        luaCode += "        local x2 = cx + amplitude * math.sin(angle + math.pi)\n";
        luaCode += "        cairo_move_to(cr, x1, y)\n";
        luaCode += "        cairo_line_to(cr, x2, y)\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n";
        luaCode += "    cairo_set_line_width(cr, thickness)\n";
        luaCode += "    cairo_set_source_rgba(cr, col1[1], col1[2], col1[3], 0.15)\n";
        luaCode += "    local started = false\n";
        luaCode += "    for t = 0, 1, 0.01 do\n";
        luaCode += "        local y = start_y + t * (end_y - start_y)\n";
        luaCode += "        local x = cx + amplitude * math.sin(t * cycles * 2 * math.pi + offset)\n";
        luaCode += "        if not started then cairo_move_to(cr, x, y); started = true\n";
        luaCode += "        else cairo_line_to(cr, x, y) end\n";
        luaCode += "    end\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    if display_p1 > 0 then\n";
        luaCode += "        cairo_set_source_rgba(cr, r1, g1, b1, 1)\n";
        luaCode += "        started = false\n";
        luaCode += "        for t = 0, display_p1, 0.01 do\n";
        luaCode += "            local y = start_y + t * (end_y - start_y)\n";
        luaCode += "            local x = cx + amplitude * math.sin(t * cycles * 2 * math.pi + offset)\n";
        luaCode += "            if not started then cairo_move_to(cr, x, y); started = true\n";
        luaCode += "            else cairo_line_to(cr, x, y) end\n";
        luaCode += "        end\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n";
        luaCode += "    cairo_set_source_rgba(cr, col2[1], col2[2], col2[3], 0.15)\n";
        luaCode += "    started = false\n";
        luaCode += "    for t = 0, 1, 0.01 do\n";
        luaCode += "        local y = start_y + t * (end_y - start_y)\n";
        luaCode += "        local x = cx + amplitude * math.sin(t * cycles * 2 * math.pi + math.pi + offset)\n";
        luaCode += "        if not started then cairo_move_to(cr, x, y); started = true\n";
        luaCode += "        else cairo_line_to(cr, x, y) end\n";
        luaCode += "    end\n";
        luaCode += "    cairo_stroke(cr)\n";
        luaCode += "    if display_p2 > 0 then\n";
        luaCode += "        cairo_set_source_rgba(cr, r2, g2, b2, 1)\n";
        luaCode += "        started = false\n";
        luaCode += "        for t = 0, display_p2, 0.01 do\n";
        luaCode += "            local y = start_y + t * (end_y - start_y)\n";
        luaCode += "            local x = cx + amplitude * math.sin(t * cycles * 2 * math.pi + math.pi + offset)\n";
        luaCode += "            if not started then cairo_move_to(cr, x, y); started = true\n";
        luaCode += "            else cairo_line_to(cr, x, y) end\n";
        luaCode += "        end\n";
        luaCode += "        cairo_stroke(cr)\n";
        luaCode += "    end\n";
        luaCode += "end\n\n";

        luaCode += "function conky_main_visuals()\n";
        luaCode += "    if conky_window == nil then return end\n";
        luaCode += "    local cs\n";
        luaCode += "    if cairo_xlib_surface_create ~= nil then\n";
        luaCode += "        cs = cairo_xlib_surface_create(conky_window.display, conky_window.drawable, conky_window.visual, conky_window.width, conky_window.height)\n";
        luaCode += "    elseif cairo_wayland_surface_create ~= nil then\n";
        luaCode += "        cs = cairo_wayland_surface_create(conky_window.display, conky_window.surface, conky_window.width, conky_window.height)\n";
        luaCode += "    else\n";
        luaCode += "        print('ConkyForge Error: No se encontro la superficie de dibujo en cairo.')\n";
        luaCode += "        return\n";
        luaCode += "    end\n";
        luaCode += "    local cr = cairo_create(cs)\n";
        luaCode += "    local updates = tonumber(conky_parse('${updates}')) or 0\n";
        luaCode += "    if updates > 3 then\n";

        for(let i=0; i<blocks.length; i++) {
            let vis = blocks[i];
            let type = vis.dataset.type;
            let sX = (Math.floor(vis.offsetLeft * s) || 0) + parseInt(vis.dataset.offx || 0);
            let sY = (Math.floor(vis.offsetTop * s) || 0) + parseInt(vis.dataset.offy || 0);
            let bWidth = Math.floor(vis.offsetWidth * s) || 40;
            let bHeight = Math.floor(vis.offsetHeight * s) || 20;

            if (type === 'image') {
                luaCode += "        draw_image_base(cr, " + sX + ", " + sY + ", " + bWidth + ", " + bHeight + ", \"" + vis.dataset.extra + "\")\n";
            }
            else if (type === 'anim_png') {
                let parts = vis.dataset.extra.split(',');
                let prefix = parts[0];
                let totalFrames = parseInt(parts[1]) || 30;
                let animSpeed = parseInt(parts[2]) || 1;
                luaCode += "        local current_frame = math.floor(updates / " + animSpeed + ") % " + totalFrames + " + 1\n";
                luaCode += "        draw_image_base(cr, " + sX + ", " + sY + ", " + bWidth + ", " + bHeight + ", \"" + prefix + "\" .. current_frame .. \".png\")\n";
            }
        }

        let rgbText = hexToRgbRatio(colorInputs.text ? colorInputs.text.value : "#FFFFFF");
        let rgbAccent = hexToRgbRatio(colorInputs.accent ? colorInputs.accent.value : "#8BE9FD");
        let rgbCpu = hexToRgbRatio(colorInputs.cpu ? colorInputs.cpu.value : "#FF79C6");
        let rgbRam = hexToRgbRatio(colorInputs.ram ? colorInputs.ram.value : "#F1FA8C");
        let rgbDisk = hexToRgbRatio(colorInputs.disk ? colorInputs.disk.value : "#50FA7B");
        let rgbTemp = hexToRgbRatio(colorInputs.temp ? colorInputs.temp.value : "#FFB86C");

        for(let i=0; i<blocks.length; i++) {
            let vis = blocks[i];
            let type = vis.dataset.type;
            let sX = (Math.floor(vis.offsetLeft * s) || 0) + parseInt(vis.dataset.offx || 0);
            let sY = (Math.floor(vis.offsetTop * s) || 0) + parseInt(vis.dataset.offy || 0);
            let bWidth = Math.floor(vis.offsetWidth * s) || 40;
            let bHeight = Math.floor(vis.offsetHeight * s) || 20;

            if (type === 'line') {
                let parts = vis.dataset.extra.split(',');
                let dir = parts[0] ? parts[0].trim().toLowerCase() : 'h';
                let thick = parseInt(parts[1]) || 2;
                let customCol = parts[2] ? parts[2].trim() : null;
                let finalRgb = (customCol && customCol.startsWith('#')) ? hexToRgbRatio(customCol) : rgbAccent;

                if (dir === 'v') {
                    let lineX = sX + Math.floor(bWidth / 2) - Math.floor(thick / 2);
                    luaCode += "        cairo_rectangle(cr, " + lineX + ", " + sY + ", " + thick + ", " + bHeight + ")\n";
                } else {
                    let lineY = sY + Math.floor(bHeight / 2) - Math.floor(thick / 2);
                    luaCode += "        cairo_rectangle(cr, " + sX + ", " + lineY + ", " + bWidth + ", " + thick + ")\n";
                }
                luaCode += "        cairo_set_source_rgba(cr, " + finalRgb + ", 0.8)\n";
                luaCode += "        cairo_fill(cr)\n";
            }
            else if (type === 'line_diag') {
                let parts = vis.dataset.extra.split(',');
                let dir = parts[0];
                let thick = parseInt(parts[1]) || 2;
                let customCol = parts[2] ? parts[2].trim() : null;
                let finalRgb = (customCol && customCol.startsWith('#')) ? hexToRgbRatio(customCol) : rgbAccent;

                luaCode += "        cairo_set_line_width(cr, " + thick + ")\n";
                luaCode += "        cairo_set_source_rgba(cr, " + finalRgb + ", 0.8)\n";
                luaCode += "        cairo_set_line_cap(cr, CAIRO_LINE_CAP_ROUND)\n";
                if (dir === "2") {
                    luaCode += "        cairo_move_to(cr, " + sX + ", " + (sY + bHeight) + ")\n";
                    luaCode += "        cairo_line_to(cr, " + (sX + bWidth) + ", " + sY + ")\n";
                } else {
                    luaCode += "        cairo_move_to(cr, " + sX + ", " + sY + ")\n";
                    luaCode += "        cairo_line_to(cr, " + (sX + bWidth) + ", " + (sY + bHeight) + ")\n";
                }
                luaCode += "        cairo_stroke(cr)\n";
            }
            else if (type === 'geometry') {
                let parts = vis.dataset.extra.split(',');
                let geoType = parts[0] || '1';
                let thick = parseInt(parts[1]) || 2;
                let customCol = parts[2] ? parts[2].trim() : null;
                let finalRgb = (customCol && customCol.startsWith('#')) ? hexToRgbRatio(customCol) : rgbAccent;

                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let radius = Math.floor(Math.min(bWidth, bHeight) / 2) - Math.floor(thick / 2);

                let angleStart, angleEnd;
                if (geoType === '1') { angleStart = "0"; angleEnd = "2 * math.pi"; }
                else if (geoType === '2') { angleStart = "math.pi"; angleEnd = "2 * math.pi"; }
                else if (geoType === '3') { angleStart = "0"; angleEnd = "math.pi"; }
                else if (geoType === '4') { angleStart = "math.pi / 2"; angleEnd = "3 * math.pi / 2"; }
                else if (geoType === '5') { angleStart = "-math.pi / 2"; angleEnd = "math.pi / 2"; }
                else { angleStart = "0"; angleEnd = "2 * math.pi"; }

                luaCode += "        cairo_set_line_width(cr, " + thick + ")\n";
                luaCode += "        cairo_set_source_rgba(cr, " + finalRgb + ", 0.8)\n";
                luaCode += "        cairo_arc(cr, " + centerX + ", " + centerY + ", " + radius + ", " + angleStart + ", " + angleEnd + ")\n";
                luaCode += "        cairo_stroke(cr)\n";
            }
            else if (type === 'neon') {
                let parts = vis.dataset.extra.split(',');
                let nType = parts[0] ? parts[0].trim() : '1';
                let thick = parseInt(parts[1]) || 2;
                let customCol = parts[2] ? parts[2].trim() : null;
                let finalRgb = (customCol && customCol.startsWith('#')) ? hexToRgbRatio(customCol) : hexToRgbRatio("#00FFFF");

                if (nType === '1') { // Horiz
                    let lineY = sY + Math.floor(bHeight / 2);
                    luaCode += "        draw_neon_line(cr, " + sX + ", " + lineY + ", " + (sX + bWidth) + ", " + lineY + ", " + thick + ", " + finalRgb + ")\n";
                } else if (nType === '2') { // Vert
                    let lineX = sX + Math.floor(bWidth / 2);
                    luaCode += "        draw_neon_line(cr, " + lineX + ", " + sY + ", " + lineX + ", " + (sY + bHeight) + ", " + thick + ", " + finalRgb + ")\n";
                } else if (nType === '3') { // Circle
                    let centerX = sX + Math.floor(bWidth / 2);
                    let centerY = sY + Math.floor(bHeight / 2);
                    let radius = Math.floor(Math.min(bWidth, bHeight) / 2) - thick;
                    if (radius < 1) radius = 1;
                    luaCode += "        draw_neon_circle(cr, " + centerX + ", " + centerY + ", " + radius + ", " + thick + ", " + finalRgb + ")\n";
                }
            }
            else if (type === 'ticker') {
                let speed = parseInt(vis.dataset.extra) || 2;
                let uniqueId = "tick_" + sX + "_" + sY;
                luaCode += "        draw_system_ticker(cr, " + sX + ", " + sY + ", " + bWidth + ", " + bHeight + ", \"" + uniqueId + "\", " + speed + ", \"" + userFont + "\", {" + rgbText + "}, {" + rgbCpu + "}, {" + rgbRam + "}, {" + rgbTemp + "}, {" + rgbAccent + "}, {" + rgbDisk + "})\n";
            }
            else if (type === 'text_vert') {
                let parsedData = vis.dataset.extra.split(',');
                let txtStr = parsedData[0] || "TEXT";
                let userSize = parseInt(parsedData[1]) || 62;
                let spacing = parseInt(parsedData[2]) || 0;
                luaCode += "        draw_stacked_vertical_text(cr, " + sX + ", " + sY + ", " + bWidth + ", " + bHeight + ", \"" + txtStr + "\", " + Math.floor(userSize * s) + ", " + rgbAccent + ", " + spacing + ")\n";
            }
            else if (type === 'text_horiz') {
                let parsedData = vis.dataset.extra.split(',');
                let txtStr = parsedData[0] || "TEXT";
                let userSize = parseInt(parsedData[1]) || 24;
                let spacing = parseInt(parsedData[2]) || 0;
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                luaCode += "        draw_horizontal_text_spaced(cr, " + centerX + ", " + centerY + ", \"" + txtStr + "\", " + Math.floor(userSize * s) + ", " + rgbAccent + ", " + spacing + ")\n";
            }
            else if (type === 'disk_lua') {
                let parts = vis.dataset.extra.split(',');
                let diskPath = parts[0];
                let diskThick = parseInt(parts[1]) || 8;
                let diskLabel = diskPath === '/' ? 'Root' : (diskPath.split('/').filter(p => p).pop() || diskPath);
                diskLabel = diskLabel.charAt(0).toUpperCase() + diskLabel.slice(1);

                luaCode += "        draw_disk_bar(cr, " + sX + ", " + sY + ", " + bWidth + ", " + bHeight + ", \"" + diskPath + "\", \"" + diskLabel + "\", {" + rgbDisk + "}, {" + rgbText + "}, " + diskThick + ")\n";
            }
            else if (type === 'eq_cpu') {
                let count = parseInt(vis.dataset.extra) || 20;
                luaCode += "        draw_eq_vertical(cr, " + sX + ", " + sY + ", " + bWidth + ", " + bHeight + ", " + count + ", {" + rgbCpu + "})\n";
            }
            else if (type === 'eq_horiz') {
                let count = parseInt(vis.dataset.extra) || 8;
                luaCode += "        draw_eq_horizontal(cr, " + sX + ", " + sY + ", " + bWidth + ", " + bHeight + ", " + count + ", {" + rgbRam + "})\n";
            }
            else if (type === 'eq_circ') {
                let count = parseInt(vis.dataset.extra) || 16;
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let radius = Math.floor(Math.min(bWidth, bHeight) / 2);
                luaCode += "        draw_eq_circular(cr, " + centerX + ", " + centerY + ", " + radius + ", " + count + ", {" + rgbAccent + "})\n";
            }
            else if (type === 'eq_circ_open') {
                let count = parseInt(vis.dataset.extra) || 16;
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let radius = Math.floor(Math.min(bWidth, bHeight) / 2);
                luaCode += "        draw_eq_circular_open(cr, " + centerX + ", " + centerY + ", " + radius + ", " + count + ", {" + rgbAccent + "}, {" + rgbCpu + "})\n";
            }
            else if (type === 'eq_concent') {
                let count = parseInt(vis.dataset.extra) || 8;
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let radius = Math.floor(Math.min(bWidth, bHeight) / 2);
                luaCode += "        draw_eq_concentric(cr, " + centerX + ", " + centerY + ", " + radius + ", " + count + ", {" + rgbCpu + "})\n";
            }
            else if (type === 'eq_concent_open') {
                let count = parseInt(vis.dataset.extra) || 8;
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let radius = Math.floor(Math.min(bWidth, bHeight) / 2);
                luaCode += "        draw_eq_concentric_open(cr, " + centerX + ", " + centerY + ", " + radius + ", " + count + ", {" + rgbCpu + "})\n";
            }
            else if (type === 'ring_cpu' || type === 'ring_ram') {
                let isCPU = type === 'ring_cpu';
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let dynamicRadius = Math.max(10, Math.floor(Math.min(bWidth, bHeight) / 2) - 15);
                let fontVal = Math.floor(22 * s); let fontLbl = Math.floor(15 * s); let scaleOff = Math.floor(10 * s);

                let rgbLuaString = isCPU ? "{" + rgbCpu + "}" : "{" + rgbRam + "}";
                let label = isCPU ? "CPU" : "RAM";
                let conkyVar = isCPU ? "'${cpu cpu0}'" : "'${memperc}'";
                let ringThick = Math.floor(baseThickness * 1.5 * s);

                luaCode += "        local raw_val = tonumber(conky_parse(" + conkyVar + ")) or 0\n";
                luaCode += "        draw_ring(cr, {x=" + centerX + ", y=" + centerY + ", radius=" + dynamicRadius + ", thickness=" + ringThick + ", font_val=" + fontVal + ", font_lbl=" + fontLbl + ", scale_offset=" + scaleOff + ", start_angle=0, end_angle=360, bgc={1,1,1}, bga=0.1, fgc=" + rgbLuaString + ", fga=1, suffix=\"%%\"}, raw_val/100, raw_val, \"" + label + "\")\n";
            }
            else if (type === 'spiral_rev') {
                let parts = vis.dataset.extra.split(',');
                let spVar = parts[0] || 'cpu';
                if (spVar === 'mem') spVar = 'memperc';
                let spThick = parseInt(parts[1]) || baseThickness;
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let radius = Math.floor(Math.min(bWidth, bHeight) / 2) - spThick;
                luaCode += "        local sp_val = tonumber(conky_parse('${" + spVar + "}')) or 0\n";
                luaCode += "        draw_spiral_inverse(cr, " + centerX + ", " + centerY + ", " + radius + ", sp_val, 100, {" + rgbDisk + "}, " + spThick + ")\n";
            }
            else if (type === 'spiral_dna') {
                let spThick = parseInt(vis.dataset.extra) || baseThickness;
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                luaCode += "        local dna_cpu = tonumber(conky_parse('${cpu}')) or 0\n";
                luaCode += "        local dna_ram = tonumber(conky_parse('${memperc}')) or 0\n";
                luaCode += "        draw_spiral_dna(cr, " + centerX + ", " + centerY + ", " + bWidth + ", " + bHeight + ", dna_cpu, dna_ram, 100, {" + rgbCpu + "}, {" + rgbRam + "}, " + spThick + ")\n";
            }
            else if (type === 'graph_fluid') {
                let uniqueId = "netwave_" + sX + "_" + sY;
                luaCode += "        local d_val = tonumber(conky_parse('${downspeedf " + vis.dataset.extra + "}')) or 0\n";
                luaCode += "        local u_val = tonumber(conky_parse('${upspeedf " + vis.dataset.extra + "}')) or 0\n";
                luaCode += "        draw_smooth_net_graph(cr, " + sX + ", " + sY + ", " + bWidth + ", " + bHeight + ", d_val, u_val, {" + rgbAccent + "}, {" + rgbDisk + "}, \"" + uniqueId + "\")\n";
            }
            else if (type === 'ring_gpu_dual') {
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let dynamicRadius = Math.max(10, Math.floor(Math.min(bWidth, bHeight) / 2) - 10);
                let parts = (vis.dataset.extra || "NVIDIA,0").split(',');
                let vendor = parts[0];
                let gpuId = parts[1] || "0";
                let gpuThick = Math.floor(baseThickness * 1.2 * s);

                if (vendor === 'AMD') {
                    luaCode += "        local gpu_temp = tonumber(conky_parse('${execi 2 sensors | grep -A 2 \"amdgpu\" | grep \"temp1\" | grep -Eo \"[0-9]{2,3}\\\\.[0-9]\" | head -n 1 | cut -d. -f1}')) or 0\n";
                    luaCode += "        local amd_vram_used = tonumber(conky_parse('${execi 2 cat /sys/class/drm/card" + gpuId + "/device/mem_info_vram_used 2>/dev/null}')) or 0\n";
                    luaCode += "        local amd_vram_total = tonumber(conky_parse('${execi 2 cat /sys/class/drm/card" + gpuId + "/device/mem_info_vram_total 2>/dev/null}')) or 1\n";
                    luaCode += "        local gpu_mem = math.floor((amd_vram_used / amd_vram_total) * 100)\n";
                } else {
                    luaCode += "        local gpu_temp = tonumber(conky_parse('${execi 2 nvidia-smi -i " + gpuId + " --query-gpu=temperature.gpu --format=csv,noheader}')) or 0\n";
                    luaCode += "        local gpu_mem = tonumber(conky_parse('${execi 2 nvidia-smi -i " + gpuId + " --query-gpu=utilization.memory --format=csv,noheader | tr -d \" %%\"}')) or 0\n";
                }
                luaCode += "        draw_concentric_gpu(cr, " + centerX + ", " + centerY + ", " + dynamicRadius + ", " + gpuThick + ", gpu_temp, gpu_mem, \"" + vendor + " " + gpuId + "\", {" + rgbText + "}, {" + rgbTemp + "}, {" + rgbRam + "})\n";
            }
            else if (type === 'analog_clock') {
                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let dynamicRadius = Math.max(10, Math.floor(Math.min(bWidth, bHeight) / 2) - 5);
                luaCode += "        draw_analog_clock(cr, " + centerX + ", " + centerY + ", " + dynamicRadius + ", {" + rgbText + "}, {" + rgbAccent + "}, {" + rgbTemp + "})\n";
            }
            else if (type === 'globe_3d') {
                let parts = vis.dataset.extra.split(',');
                let spX = parseFloat(parts[0]) || 0.01;
                let spY = parseFloat(parts[1]) || 0.03;
                let baseHex = parts[2] ? parts[2].trim() : null;
                let fillHex = parts[3] ? parts[3].trim() : null;

                let cBase = (baseHex && baseHex.startsWith('#')) ? hexToRgbRatio(baseHex) : rgbAccent;
                let cFill = (fillHex && fillHex.startsWith('#')) ? hexToRgbRatio(fillHex) : rgbRam;

                let centerX = sX + Math.floor(bWidth / 2);
                let centerY = sY + Math.floor(bHeight / 2);
                let radius = Math.floor(Math.min(bWidth, bHeight) / 2) - 15;

                luaCode += "        local ram_val = tonumber(conky_parse('${memperc}')) or 0\n";
                luaCode += "        draw_spinning_globe(cr, " + centerX + ", " + centerY + ", " + radius + ", " + spX + ", " + spY + ", ram_val, {" + cBase + "}, {" + cFill + "})\n";
            }
        }

        luaCode += "    end\n    cairo_destroy(cr)\n    cairo_surface_destroy(cs)\nend\n";

        // Descargamos el LUA al final para dar tiempo a los anteriores
       // downloadFile('visuals.lua', luaCode);
    });
}
