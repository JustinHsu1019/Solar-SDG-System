from flask import Blueprint, render_template, request

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    return render_template('index.html')


@bp.route('/solar', methods=['GET', 'POST'])
def solar():
    result = None
    if request.method == 'POST':
        area = float(request.form.get('area', 0))
        # 假設每平方公尺年平均日照量(度)為 1200
        sunlight = area * 1200
        result = f'預估年日照總量: {sunlight:.2f} 度'
    return render_template('solar.html', result=result)
