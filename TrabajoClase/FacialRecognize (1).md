# FacialRecognize

mediante el archivo xml puedes reconocer ciertos patrones asociados a un rostro.


```python
import cv2 as cv

cap = cv.VideoCapture(0)
while(True):
    ret, img = cap.read()
    if ret == True:
        img2 = cv.cvtColor(img, cv.COLOR_BGR2HSV)
        ubb=(100,0,0)
        uba=(110, 255, 255)
        mask = cv.inRange(img2, ubb, uba) 
        res = cv.bitwise_and(img,img, mask-mask)
        cv.imshow('img2', img)
        cv.imshow('res', res)
        cv.imshow('mask', mask)
        k =cv.waitKey(20) & 0xFF
        if k == 27 :
            break
cap.release()
cv.destroyAllWindows()
```


```python
import numpy as np
import cv2 as cv
import math
rostro = cv.CascadeClassifier('C:\\Users\\Jorgi\\Desktop\\Inteligencia Artificial\\haarcascade_frontalface_alt.xml')

cap = cv.VideoCapture(0)
while True:
    ret, frame = cap.read()
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    rostros = rostro.detectMultiScale(gray, 1.3, 5)
    for(x, y, w, h) in rostros:
        frame = cv.rectangle(frame, (x,y), (x+w, y+h), (0, 255, 0), 2)
    cv.imshow('rostros', frame)
    k =cv.waitKey(1)
    if k == 27 :
        break
cap.release()
cv.destroyAllWindows()
```

Podemos guardar el segmentado del rostro encontrado, con esto crearemos nuestro propio DataSet; solo falta acondicionar el tamaño real del pixelaje.

Con la información (frame) ya segmenteado (frame 2) ahora debemos estandarizar el tamaño. 


```python
import numpy as np
import cv2 as cv
import math
rostro = cv.CascadeClassifier('C:\\Users\\Jorgi\\Desktop\\Inteligencia Artificial\\haarcascade_frontalface_alt.xml')

cap = cv.VideoCapture(0)
i = 0
while True:
    ret, frame = cap.read()
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    rostros = rostro.detectMultiScale(gray, 1.3, 5)
    for(x, y, w, h) in rostros:
        #frame = cv.rectangle(frame, (x,y), (x+w, y+h), (0, 255, 0), 2)
        frame2 = frame[y:y+h, x:x+w]
        frame2 = cv.resize(frame2, (100, 100), interpolation = cv.INTER_AREA)
        cv.imshow('rostros encontrados', frame2)
        cv.imwrite('D:\\MuestreoRostros\\Jorge\\'+str(i)+'.png', frame2)
    #cv.imshow('rostros', frame) 
    i=i+1
    k =cv.waitKey(1)
    if k == 27 :
        break
cap.release()
cv.destroyAllWindows()
```

Generar XML


```python
import cv2 as cv 
import numpy as np 
import os
#rostro = cv.CascadeClassifier('C:\\Users\\Jorgi\\Desktop\\Inteligencia Artificial\\haarcascade_frontalface_alt.xml')
dataSet = 'D:\\MuestreoRostros'
faces  = os.listdir(dataSet)
print(faces)

labels = []
facesData = []
label = 0 
for face in faces:
    facePath = dataSet+'\\'+face
    for faceName in os.listdir(facePath):
        labels.append(label)
        facesData.append(cv.imread(facePath+'\\'+faceName,0))
    label = label + 1
print(np.count_nonzero(np.array(labels)==0)) 

faceRecognizer = cv.face.EigenFaceRecognizer_create()
faceRecognizer.train(facesData, np.array(labels))
faceRecognizer.write('D:\\MuestreoRostros\\EigenfaceJorge.xml')

```

    ['Angel', 'Jonhy', 'Jorge']
    301
    


```python
pwd

```

Generar xml


```python
import cv2 as cv 
import numpy as np 
import os
#rostro = cv.CascadeClassifier('C:\\Users\\Jorgi\\Desktop\\Inteligencia Artificial\\haarcascade_frontalface_alt.xml')
dataSet = 'D:\\MuestreoRostros'
faces  = os.listdir(dataSet)
print(faces)
labels = []
facesData = []
label = 0 
for face in faces:
    facePath = dataSet+'/'+face
    for faceName in os.listdir(facePath):
        labels.append(label)
        facesData.append(cv.imread(facePath+'/'+faceName,0))
    label = label + 1
print(np.count_nonzero(np.array(labels)==0)) 
faceRecognizer = cv.face.EigenFaceRecognizer_create()
faceRecognizer.train(facesData, np.array(labels))
faceRecognizer.write('D:\\MuestreoRostros\\EigenfaceJorge.xml')


```

A buscar rostros


```python
import cv2 as cv
import os 

faceRecognizer = cv.face.EigenFaceRecognizer_create()
faceRecognizer.read('D:\\MuestreoRostros\\EigenfaceJorge.xml')

cap = cv.VideoCapture(0)
rostro = cv.CascadeClassifier('C:\\Users\\Jorgi\\Desktop\\Inteligencia Artificial\\haarcascade_frontalface_alt.xml')
while True:
    ret, frame = cap.read()
    if ret == False: break
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    cpGray = gray.copy()
    rostros = rostro.detectMultiScale(gray, 1.3, 3)
    for(x, y, w, h) in rostros:
        frame2 = cpGray[y:y+h, x:x+w]
        frame2 = cv.resize(frame2,  (100,100), interpolation=cv.INTER_CUBIC)
        result = faceRecognizer.predict(frame2)
        #cv.putText(frame, '{}'.format(result), (x,y-20), 1,3.3, (0,0,0), 1, cv.LINE_AA)
        if result[1] > 2800:
            cv.putText(frame,'{}'.format(faces[result[0]]),(x,y-25),2,1.1,(0,255,0),1,cv.LINE_AA)
            cv.rectangle(frame, (x,y),(x+w,y+h),(0,255,0),2)
        else:
            cv.putText(frame,'Desconocido',(x,y-20),2,0.8,(0,0,255),1,cv.LINE_AA)
            cv.rectangle(frame, (x,y),(x+w,y+h),(0,0,255),2)
    cv.imshow('frame', frame)
    k = cv.waitKey(1)
    if k == 27:
        break
cap.release()
cv.destroyAllWindows()
```


```python

```
