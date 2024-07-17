let eegInterval;
let moodInterval;
let moodChart;
let musicPlayer;

function initializeChart() {
    const ctx = document.getElementById('mood-chart').getContext('2d');
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'EEG Value',
                data: [],
                borderColor: [],
                borderWidth: 1,
                fill: false,
                segment: {
                    borderColor: ctx => {
                        const value = ctx.p1.parsed.y;
                        return value > 0.5 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';
                    }
                }
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'EEG Value'
                    },
                    suggestedMin: 0,
                    suggestedMax: 1
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Brainwave Activity',
                    font: {
                        size: 24
                    }
                },
                legend: {
                    display: true,
                    labels: {
                        generateLabels: function(chart) {
                            return [
                                {
                                    text: 'Relaxed',
                                    fillStyle: 'rgba(75, 192, 192, 0.5)',
                                    strokeStyle: 'rgba(75, 192, 192, 1)',
                                    lineWidth: 2,
                                    hidden: false
                                },
                                {
                                    text: 'Stressed',
                                    fillStyle: 'rgba(255, 99, 132, 0.5)',
                                    strokeStyle: 'rgba(255, 99, 132, 1)',
                                    lineWidth: 2,
                                    hidden: false
                                }
                            ];
                        }
                    }
                }
            }
        }
    });
}

// Function to start session
document.getElementById('start-session-button').addEventListener('click', function() {
    fetch('/start_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration: 30 })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Session started:', data);
        // Start fetching EEG data and mood analysis
        startFetchingData();
    })
    .catch(error => console.error('Error starting session:', error));
});

// Function to play music
document.getElementById('play-button').addEventListener('click', function() {
    fetch('/play_music', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        console.log('Music playing:', data);
        // Play music based on current mood analysis
        fetch('/fetch_mood_analysis')
            .then(response => response.json())
            .then(moodAnalysis => {
                console.log('Received mood analysis:', moodAnalysis);
                if (moodAnalysis.mood === 'Relaxed') {
                    playRelaxedMusic();
                } else if (moodAnalysis.mood === 'Stressed') {
                    playStressedMusic();
                }
            })
            .catch(error => console.error('Error fetching mood analysis:', error));
    })
    .catch(error => console.error('Error playing music:', error));
});

// Function to toggle between pause and resume music
document.getElementById('pause-button').addEventListener('click', function() {
    if (musicPlayer && !musicPlayer.paused) {
        musicPlayer.pause();
        this.textContent = 'Resume Music'; 
    } else {
        if (musicPlayer) {
            musicPlayer.play(); // Continue playing from where it was paused
        } else {
            // If no music is currently playing, start playing
            fetch('/play_music', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                console.log('Music playing:', data);
                // Fetch current mood analysis and play appropriate music
                fetch('/fetch_mood_analysis')
                    .then(response => response.json())
                    .then(moodAnalysis => {
                        console.log('Received mood analysis:', moodAnalysis);
                        if (moodAnalysis.mood === 'Relaxed') {
                            playRelaxedMusic();
                        } else if (moodAnalysis.mood === 'Stressed') {
                            playStressedMusic();
                        }
                    })
                    .catch(error => console.error('Error fetching mood analysis:', error));
            })
            .catch(error => console.error('Error playing music:', error));
        }
        this.textContent = 'Pause Music';
    }
});

// Function to stop music
document.getElementById('stop-music-button').addEventListener('click', function() {
    if (musicPlayer) {
        musicPlayer.pause();
        musicPlayer.currentTime = 0;
    }
    fetch('/stop_music', { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }) 
    .then(response => response.json())
    .then(data => { 
        console.log('Music stopped:', data); 
    }) 
    .catch(error => console.error('Error stopping music:', error)); 
});

// Function to stop session
document.getElementById('stop-session-button').addEventListener('click', function() { 
    fetch('/stop_session', { 
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }) 
    .then(response => response.json()) 
    .then(data => { 
        console.log('Session stopped:', data); 
        // Stop fetching EEG data and mood analysis
        stopFetchingData(); 
    }) 
    .catch(error => console.error('Error stopping session:', error)); 
});

// Function to reset session
document.getElementById('reset-button').addEventListener('click', function() {
    fetch('/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        console.log('Reset:', data);
        stopFetchingData();
        resetVisualization();
    })
    .catch(error => console.error('Error resetting session and visualization:', error));
});

// Function to fetch and display EEG data
function fetchEEGData() {
    fetch('/fetch_eeg_data')
    .then(response => response.json())
    .then(eegData => {
        console.log('Received EEG data:', eegData);
        document.getElementById('eeg-value').textContent = eegData.value;

        // Get current time in HH:MM:SS format
        const currentTime = new Date().toLocaleTimeString();

        addDataToChart(moodChart, currentTime, eegData.value);
    })
    .catch(error => console.error('Error fetching EEG data:', error));
}

// Function to fetch and display mood analysis
function fetchMoodAnalysis() {
    fetch('/fetch_mood_analysis')
    .then(response => response.json())
    .then(moodAnalysis => {
        console.log('Received mood analysis:', moodAnalysis);
        document.getElementById('mood-value').textContent = moodAnalysis.mood;
    })
    .catch(error => console.error('Error fetching mood analysis:', error));
}

// Function to start fetching EEG data and mood analysis
function startFetchingData() {
    eegInterval = setInterval(fetchEEGData, 5000);  // Fetch every 8 seconds
    moodInterval = setInterval(fetchMoodAnalysis, 5200);  // Fetch every 8.2 seconds
}

// Function to stop fetching EEG data and mood analysis
function stopFetchingData() {
    clearInterval(eegInterval);
    clearInterval(moodInterval);
}

function updateChart(type, value) {
    const now = new Date().toLocaleTimeString();
    if (type === 'EEG') {
        moodChart.data.labels.push(now);
        moodChart.data.datasets[0].data.push(value);
    } else if (type === 'Mood') {
        moodChart.data.labels.push(now);
        moodChart.data.datasets[1].data.push(value);
    }
    moodChart.update();
}

// Function to play relaxed music
function playRelaxedMusic() {
    if (musicPlayer) {
        musicPlayer.pause();
    }
    musicPlayer = new Audio('/static/relaxed_music.mp3');
    musicPlayer.loop = true;
    musicPlayer.play();
    console.log('Playing relaxed music');
}

// Function to play stressed music
function playStressedMusic() {
    if (musicPlayer) {
        musicPlayer.pause();
    }
    musicPlayer = new Audio('/static/stressed_music.mp3');
    musicPlayer.loop = true;
    musicPlayer.play();
    console.log('Playing stressed music');
}

// Initialize the chart when the page loads
window.onload = function() {
    initializeChart();
};

// Function to add data to the chart
function addDataToChart(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data);

    // Change color based on the value
    const color = data > 0.5 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';
    chart.data.datasets[0].borderColor.push(color);
    chart.update();
}

function resetVisualization() {
    document.getElementById('eeg-value').textContent = '-';
    document.getElementById('mood-value').textContent = '-';
    moodChart.data.labels = [];
    moodChart.data.datasets[0].data = [];
    moodChart.update();
}