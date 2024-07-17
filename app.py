from flask import Flask, render_template, jsonify, request
import random

app = Flask(__name__, static_url_path='/static')

music_mapping = {
    'Relaxed': 'relaxed_music.mp3',
    'Stressed': 'stressed_music.mp3'
}
current_music = None

@app.route('/')
def index():
    return render_template('index.html')

# Function to generate random EEG data
def generate_random_eeg():
    return {
        'value': random.random()  # Generates a random float between 0 and 1
    }

# Simulated mood analysis (replace with actual analysis logic)
def analyze_mood():
    # Example: Mood analysis based on EEG data
    if eeg_data['value'] > 0.5:
        return {'mood': 'Relaxed'}
    else:
        return {'mood': 'Stressed'}

@app.route('/start_session', methods=['POST'])
def start_session():
    return jsonify({'status': 'Session started'})

@app.route('/play_music', methods=['POST'])
def play_music():
    return jsonify({'status': 'Music playing'})

@app.route('/pause_music', methods=['POST'])
def pause_music():
    global current_music
    current_music = None
    return jsonify({'status': 'Music paused'})

@app.route('/stop_music', methods=['POST']) 
def stop_music():
    global current_music
    current_music = None 
    return jsonify({"message": 'Music stopped'}) 

@app.route('/stop_session', methods=['POST']) 
def stop_session():
    print("Session stopped.") 
    return jsonify({"message": 'Session stopped'}) 

@app.route('/reset', methods=['POST'])
def reset():
    global eeg_data, mood_data
    eeg_data = {'value': '-'}
    mood_data = {'mood': '-'}
    return jsonify({"message": "Session and visualization reset"})

# Route to fetch simulated EEG data
@app.route('/fetch_eeg_data', methods=['GET'])
def fetch_eeg_data():
    global eeg_data
    eeg_data = generate_random_eeg()  # Update EEG data with new random values
    return jsonify(eeg_data)

@app.route('/fetch_mood_analysis')
def fetch_mood_analysis():
    mood = analyze_mood()
    return jsonify(mood)

if __name__ == '__main__':
    app.run(debug=True)