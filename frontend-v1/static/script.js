function runSim(mode) {
    fetch(`/run?mode=${mode}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("output").innerText = data.output;
        });
}
