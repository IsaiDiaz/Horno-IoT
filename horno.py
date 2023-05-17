import kivy
from kivy.app import App
from kivy.uix.label import Label

class HornoApp(App):
    def build(self):
        return Label(text='Hola Mundo')
    
if __name__ == '__main__':
    HornoApp().run()