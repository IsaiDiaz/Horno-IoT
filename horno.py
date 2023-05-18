from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QPushButton, QLabel, QDialog, QTableWidget, QTableWidgetItem
from PyQt5.QtGui import QColor, QPalette
from PyQt5.QtCore import Qt
import matplotlib.pyplot as plt
from PyQt5.QtWidgets import QMessageBox
import mysql.connector
from datetime import timedelta
import sys

# Conexión a la base de datos
conexion1 = mysql.connector.connect(host="localhost", user="root", passwd="", database="PRACTICA8db")
cursor1 = conexion1.cursor()
cursor2 = conexion1.cursor()

def calculate_time_stats(data):
    # Obtener los valores de encendido/apagado del horno
    horno_encendido = [row[3] for row in data]  # Ajusta el índice según la posición de la columna correspondiente

    # Calcular la diferencia de tiempo entre eventos de encendido/apagado
    duraciones = []
    estado_anterior = None
    for estado in horno_encendido:
        if estado_anterior is not None and estado != estado_anterior:
            duracion = timedelta(seconds=1)  # Ajusta el valor según tu resolución de tiempo
            duraciones.append(duracion)
        estado_anterior = estado

    # Calcular el tiempo total de encendido y apagado
    tiempo_encendido = sum(duraciones, timedelta())
    tiempo_apagado = timedelta(hours=24) - tiempo_encendido

    # Calcular el porcentaje de tiempo de encendido y apagado
    porcentaje_encendido = (tiempo_encendido / timedelta(hours=24)) * 100
    porcentaje_apagado = (tiempo_apagado / timedelta(hours=24)) * 100

    return tiempo_encendido, tiempo_apagado, porcentaje_encendido, porcentaje_apagado

class TableWindow(QDialog):
    def __init__(self, data):
        super().__init__()
        self.setWindowTitle('Tabla Horo IoT')
        self.setGeometry(1050, 700, 1050, 700)
        self.setup_ui(data)

    def setup_ui(self, data):
        layout = QVBoxLayout()

        table = QTableWidget()
        table.setRowCount(len(data))
        table.setColumnCount(len(data[0]))

        # Desactivar numeración de filas
        table.verticalHeader().setVisible(False)

        # Agregar los encabezados de columna
        for i, column_name in enumerate(cursor1.column_names):
            table.setHorizontalHeaderItem(i, QTableWidgetItem(column_name))

        # Agregar los datos a la tabla
        for i, row in enumerate(data):
            for j, value in enumerate(row):
                table.setItem(i, j, QTableWidgetItem(str(value)))

        layout.addWidget(table)
        self.setLayout(layout)

class MyApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('Horno IoT')
        self.setGeometry(1200, 700, 1200, 700)
        self.setStyleSheet("background-color: #FF4800;")  # Establecer el color de fondo
        self.setup_ui()

    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignHCenter)  # Centrar los widgets horizontalmente


        label = QLabel('NETSPHERE\n\nHORNO IOT')
        label.setAlignment(Qt.AlignCenter)
        label.setStyleSheet("font: 16pt Montserrat; color: white;")  # Establecer el color de fondo y el color de texto del botón
        layout.addWidget(label)

        button = QPushButton('Mostrar datos')
        button.clicked.connect(self.show_table)
        button.setMinimumWidth(200)  # Establecer el ancho mínimo del botón
        button.setMaximumWidth(200)  # Establecer el ancho máximo del botón
        button.setStyleSheet("background-color: black; color: white;")  # Establecer el color de fondo y el color de texto del botón
        layout.addWidget(button)
        
        button1 = QPushButton('Mostrar grafica')
        button1.clicked.connect(self.show_graph)
        button1.setMinimumWidth(200)  # Establecer el ancho mínimo del botón
        button1.setMaximumWidth(200)  # Establecer el ancho máximo del botón
        button1.setStyleSheet("background-color: black; color: white;")  # Establecer el color de fondo y el color de texto del botón
        layout.addWidget(button1)

        button3 = QPushButton('Mostrar datos calculados')
        button3.clicked.connect(self.show_calc)
        button3.setMinimumWidth(200)  # Establecer el ancho mínimo del botón
        button3.setMaximumWidth(200)  # Establecer el ancho máximo del botón
        button3.setStyleSheet("background-color: black; color: white;")  # Establecer el color de fondo y el color de texto del botón
        layout.addWidget(button3)

        button2 = QPushButton('Salir')
        button2.clicked.connect(self.close)
        button2.setMinimumWidth(200)  # Establecer el ancho mínimo del botón
        button2.setMaximumWidth(200)  # Establecer el ancho máximo del botón
        button2.setStyleSheet("background-color: black; color: white;")  # Establecer el color de fondo y el color de texto del botón
        layout.addWidget(button2)

        self.setLayout(layout)

    def show_table(self):
        # Ejecutar el query
        cursor1.execute("SELECT * FROM TablaHorno")
        data = cursor1.fetchall()

        # Abrir la nueva ventana con la tabla
        table_window = TableWindow(data)
        table_window.exec_()

    def show_graph(self):
        # Ejecutar el query
        query = "SELECT HoraActual, SensorLM35, Set_Point, Calefactor, Enfriador FROM TablaHorno"
        cursor2.execute(query)
        data = cursor2.fetchall()

        # Crear grafica con los datos SensorLM35, Set_Point, Calefactor, Enfriador,	en el eje Y y el campo HoraActual en el eje X

        # Obtener los valores de cada columna
        hora_actual = [row[0] for row in data]
        sensor_lm35 = [row[1] for row in data]
        set_point = [row[2] for row in data]
        calefactor = [row[3] for row in data]
        enfriador = [row[4] for row in data]

        # Convertir los objetos timedelta a valores numéricos
        x = [t.total_seconds() for t in hora_actual]

        # Crear la gráfica de líneas
        plt.plot(x, sensor_lm35, label='Sensor LM35')
        plt.plot(x, set_point, label='Set Point')
        plt.plot(x, calefactor, label='Calefactor')
        plt.plot(x, enfriador, label='Enfriador')

        # Personalizar la gráfica
        plt.xlabel('Hora Actual')
        plt.ylabel('Valores')
        plt.title('Gráfica de Datos')
        plt.legend()

        plt.show()

    def show_calc(self):
        # Ejecutar el query
        query = "SELECT HoraActual, SensorLM35, Set_Point, Calefactor, Enfriador FROM TablaHorno"
        cursor2.execute(query)
        data = cursor2.fetchall()

        # Crear gráfica con los datos SensorLM35, Set_Point, Calefactor, Enfriador en el eje Y y el campo HoraActual en el eje X

        # Obtener los valores de cada columna
        hora_actual = [row[0] for row in data]

        # Calcular el tiempo total de encendido y apagado
        tiempo_encendido, tiempo_apagado, porcentaje_encendido, porcentaje_apagado = calculate_time_stats(data)

        # Convertir los objetos timedelta a valores numéricos
        x = [t.total_seconds() for t in hora_actual]

        # Calcular horas totales
        horas_totales = sum(x) / 3600

        # Calcular consumo
        consumo = horas_totales * 0.5

        # Imprimir el tiempo total de encendido y apagado, y el porcentaje correspondiente en una ventaa emergente
        msg = QMessageBox()
        msg.setWindowTitle("Datos calculados")
        msg.setText(f"Tiempo total de encendido: {tiempo_encendido}\nTiempo total de apagado: {tiempo_apagado}\nPorcentaje de encendido: {porcentaje_encendido}\nPorcentaje de apagado: {porcentaje_apagado}\nConsumo: {consumo}kWh")
        msg.setIcon(QMessageBox.Information)
        msg.exec_()   

if __name__ == '__main__':
    app = QApplication(sys.argv)

    # Configurar el estilo en modo oscuro
    palette = QPalette()
    palette.setColor(QPalette.Window, QColor(53, 53, 53))
    palette.setColor(QPalette.WindowText, QColor(255, 255, 255))
    palette.setColor(QPalette.Base, QColor(25, 25, 25))
    palette.setColor(QPalette.AlternateBase, QColor(53, 53, 53))
    palette.setColor(QPalette.ToolTipBase, QColor(255, 255, 255))
    palette.setColor(QPalette.ToolTipText, QColor(255, 255, 255))
    palette.setColor(QPalette.Text, QColor(255, 255, 255))
    palette.setColor(QPalette.Button, QColor(53, 53, 53))
    palette.setColor(QPalette.ButtonText, QColor(255, 255, 255))
    palette.setColor(QPalette.BrightText, QColor(255, 0, 0))
    palette.setColor(QPalette.Link, QColor(42, 130, 218))
    palette.setColor(QPalette.Highlight, QColor(42, 130, 218))
    palette.setColor(QPalette.HighlightedText, QColor(0, 0, 0))
    app.setPalette(palette)

    window = MyApp()
    window.show()
    sys.exit(app.exec_())