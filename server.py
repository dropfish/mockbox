from flask import Flask, render_template, send_from_directory, url_for
app = Flask(__name__, template_folder='')
app.debug = True


@app.route("/")
def hello():
    return render_template('index.html')

if __name__ == "__main__":
    app.run()