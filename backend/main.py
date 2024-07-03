from flask import Flask, request, send_file
from PIL import Image, ImageDraw, ImageFont
import io

app = Flask(__name__)


def create_image_from_text(text):
    # Create a blank image
    img = Image.new('RGB', (300, 100), color=(73, 109, 137))

    # Get a drawing context
    d = ImageDraw.Draw(img)

    # Load a font
    try:
        font = ImageFont.truetype("arial.ttf", 15)
    except IOError:
        font = ImageFont.load_default()

    # Draw text on image
    d.text((10, 10), text, fill=(255, 255, 0), font=font)

    # Save the image to a byte stream
    byte_io = io.BytesIO()
    img.save(byte_io, 'PNG')
    byte_io.seek(0)

    return byte_io


@app.route('/process_text', methods=['POST'])
def process_text():
    # Get the text from the request
    text = request.form.get('text', 'No text provided')

    # Process the text (in this case, we're just creating an image with the text)
    img_io = create_image_from_text(text)

    # Return the image
    return send_file(img_io, mimetype='image/png')


if __name__ == '__main__':
    app.run(debug=True)