let renderer, camera, scene, control,stat,particlesSystem;
let Sun,
	Mercury,
	Venus,
	Earth,
	Mars,
	Jupiter,
	Saturn,
	Uranus,
	Neptune,
	stars = [];

let starNames = {};
let displayName;

const canvas = document.getElementById('main');
const cameraFar = 3000;
const clock = new THREE.Clock();       //用于计算两次animationFrame之间的间隔时间
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
init();

function init(){
	/*stats帧率统计*/								
	stat = new Stats();
	stat.domElement.style.position = 'absolute';
	stat.domElement.style.right = 'Opx';
	stat.domElement.style.top = 'Opx';
	document.body.appendChild(stat.domElement);

	/*画布大小*/
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	/*renderer*/
	renderer = new THREE.WebGLRenderer({ canvas });
	renderer.shadowMap.enabled = true; //辅助线
	renderer.shadowMapSoft = true; //柔和阴影
	renderer.setClearColor(0xffffff, 0);

	/*scene*/
	scene = new THREE.Scene();

	/*camera*/
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1 ,cameraFar);
	camera.position.set(-200,50,0);
	camera.lookAt(new THREE.Vector3(0,0,0));
	window.addEventListener('mousemove', this.onMouseMove, false);
	scene.add(camera);

	//环境光
	let ambient = new THREE.AmbientLight(0x999999);
	scene.add(ambient);

	//太阳光
	let sunLight = new THREE.PointLight(0xddddaa,1.5,500);
	scene.add(sunLight);

	//构造星空背景
	const particles = 20000;    //星星的数量
	const bufferGeometry = new THREE.BufferGeometry();    //buffer做星星

	let positions = new Float32Array(particles * 3);
	let colors = new Float32Array(particles * 3);

	let color = new THREE.Color();

	const gap = 1000;           //星星最近出现的位置


	for(let i = 0; i < positions.length; i += 3){
		//positions
		//-2gap < x <2gap
		let x = (Math.random() * gap *2) * (Math.random() < .5 ? -1 : 1);
		let y = (Math.random() * gap *2) * (Math.random() < .5 ? -1 : 1);
		let z = (Math.random() * gap *2) * (Math.random() < .5 ? -1 : 1);

		//找到xyz中的最大值
		let biggest = Math.abs(x) > Math.abs(y) ? Math.abs(x) > Math.abs(z) ? 'x' : 'z' : Math.abs(y) > Math.abs(z) ? 'y' : 'z';

		/*pos = {x,y,z}  等价于  pos = {x:x,y:y,z:z}*/
		let pos = {x,y,z};
		/*如果最大值比n要小，则复制为n*/
		if(Math.abs(pos[biggest]) < gap) pos[biggest] = pos[biggest] < 0 ? -gap : gap;

		x = pos['x'];
		y = pos['y'];
		z = pos['z'];

		positions[i] = x;
		positions[i+1] = y;
		positions[i+2] = z;

		//colors
		//70%星星有颜色
		let hasColor = Math.random() > 0.3;
		let vx, vy, vz;

		if(hasColor){
			vx = (Math.random()+1) / 2;
			vy = (Math.random()+1) / 2;
			vz = (Math.random()+1) / 2;
		}else{
			vx = 1;
			vy = 1;
			vz = 1;
		}
		color.setRGB(vx,vy,vz);
		colors[i] = color.r;
		colors[i+1] = color.g;
		colors[i+2] = color.b;
	}

	bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
	bufferGeometry.computeBoundingSphere();

	/*星星的材质*/
	let material = new THREE.PointsMaterial({size : 6 , vertexColors: THREE.VertexColors});
	particlesSystem = new THREE.Points(bufferGeometry, material);
	scene.add(particlesSystem);

	//构造太阳
	let sunSkinPic = THREE.ImageUtils.loadTexture('/image/sunCore.jpg',{},()=>{
	renderer.render(scene,camera)
	});
	Sun = new THREE.Mesh( new THREE.SphereGeometry( 12 ,16 ,16 ),
    	new THREE.MeshLambertMaterial({
        	//color: 0xffff00,
        	emissive: 0xdd4422,
        	map:sunSkinPic
    	}) 
	);
	Sun.name='Sun';
	Sun.castShadow = true;
	Sun.receiveShadow = true;
	scene.add(Sun);

	//opacity sun
	let opSun = new THREE.Mesh(new THREE.SphereGeometry(14,16,16),
		new THREE.MeshLambertMaterial({
			color : 0xff0000,
			transparent : true,
			opacity: .35
		})
	);

	opSun.name = 'Sun';
	scene.add(opSun);


	//plants
	let mercurySkinPic = THREE.ImageUtils.loadTexture('/image/mercury.jpg',{},()=>{
		renderer.render(scene,camera)
	});
	Mercury = initPlanet('Mercury', 0.02,0,'rgb(124,131,203)',20,2,mercurySkinPic);
	stars.push(Mercury);

	let venusSkinPic = THREE.ImageUtils.loadTexture('/image/venus.jpg',{},()=>{
		renderer.render(scene,camera)
	});
	Venus = initPlanet('Venus', 0.012,0,'rgb(190,138,44)',30,4,venusSkinPic);
	stars.push(Venus);

	let earthSkinPic = THREE.ImageUtils.loadTexture('/image/earth.jpg',{},()=>{
		renderer.render(scene,camera)
	});
	Earth = initPlanet('Earth', 0.010,0,'rgb(46,69,119)',40,5,earthSkinPic);
	stars.push(Earth);

	let marsSkinPic = THREE.ImageUtils.loadTexture('/image/mars.jpg',{},()=>{
		renderer.render(scene,camera)
	});
	Mars = initPlanet('Mars',0.008,0, 'rgb(210,81,16)',50,4,marsSkinPic);
	stars.push(Mars);

	let jupiterSkinPic = THREE.ImageUtils.loadTexture('/image/jupiter.jpg',{},()=>{
		renderer.render(scene,camera)
	});
	Jupiter = initPlanet('Jupiter',0.006,0,'rgb(254,208,101)',70,9,jupiterSkinPic);
	stars.push(Jupiter);

	let saturnSkinPic = THREE.ImageUtils.loadTexture('/image/saturn.jpg',{},()=>{
		renderer.render(scene,camera)
	});
	Saturn = initPlanet('Saturn', 0.005,0,'rgb(210,140,39)',100,7,saturnSkinPic,{
		color:'rgb(136,75,30)',
		innerRedius:9,
		outerRadius:11
	});
	stars.push(Saturn);

	let uranusSkinPic = THREE.ImageUtils.loadTexture('/image/uranus.jpg',{},()=>{
		renderer.render(scene,camera)
	});
	Uranus = initPlanet('Uranus', 0.003,0,'rgb(49,168,218)',120,4,uranusSkinPic);
	stars.push(Uranus);

	let neptuneSkinPic = THREE.ImageUtils.loadTexture('/image/neptune.jpg',{},()=>{
		renderer.render(scene,camera)
	});
	Neptune = initPlanet('Neptune',0.002,0,'rgb(84,125,204)',150,3,neptuneSkinPic);
	stars.push(Neptune);

	/*camera control*/
	control = new THREE.FirstPersonControls(camera, canvas);
	control.movementSpeed = 100;                                 //镜头移动速度
	control.lookSpeed = 0.125;									//镜头角度移动速度
	control.lookVertical = true;

	displayPlanetName();
	renderer.render(scene,camera);
	requestAnimationFrame(()=>move());
};
/**
*init planets
*@param name
*@param color
*@param distance
*@param volume
*@returns{{name:* , distance:* , volume: * , Mesh: THREE,Mesh}}
*/
function initPlanet(name,  speed, angle, color, distance, volume, map, ringMsg){
	let mesh = new THREE.Mesh(new THREE.SphereGeometry(volume, 16,16),
		new THREE.MeshLambertMaterial({color,map})
		);
	mesh.position.z = -distance;
	mesh.receiveShadow = true;
	mesh.castShadow = true;

	mesh.name = name;

	let track = new THREE.Mesh(new THREE.RingGeometry(distance-0.2, distance+0.2,64,1),
			new THREE.MeshBasicMaterial({color:0x888888, side:THREE.DoubleSide})
		);
	track.rotation.x = -Math.PI/2;
	scene.add(track);

	let star = {
		name,
		speed,
		angle,
		distance,
		volume,
		Mesh:mesh
	}

	//如果有碎星带
	if(ringMsg){
		let ring = new THREE.Mesh(new THREE.RingGeometry(ringMsg.innerRedius,ringMsg.outerRadius,32,6),
			new THREE.MeshBasicMaterial({color:ringMsg.color,side:THREE.DoubleSide,opacity:7,transparent:true})
			);
		ring.name = 'Ring of ${name}';
		ring.rotation.x = -Math.PI / 3;
		ring.rotation.y = -Math.PI / 4;
		scene.add(ring);

		star.ring = ring;
	}

	/*/对地球的特殊处理
	if(name == 'Earth'){
		let earthSkinPic = THREE.ImageUtils.loadTexture('/image/earth.jpg',{},()=>{
			renderer.render(scene,camera)
		});
		mesh.material.map = earthSkinPic;
	}
	*/
	scene.add(mesh);

	return star;
};
//每一颗星星的公转
function moveEachStar(star){

	star.angle+=star.speed;
     if (star.angle > Math.PI * 2) {
   		star.angle -= Math.PI * 2;
  	}
	star.Mesh.position.set(star.distance * Math.sin(star.angle), 0 , star.distance * Math.cos(star.angle));

	//碎星带
	if(star.ring){
		star.ring.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
	}
}

//每一颗星星的自转
function moveSelfEachStar(star){
	star.Mesh.rotation.y = (star.Mesh.rotation.y == 2*Math.PI ? 0.001*Math.PI : star.Mesh.rotation.y + 0.001*Math.PI);
}

function displayPlanetName(){
    stars.forEach(star=>nameConstructor(star.name,star.volume));
    nameConstructor('Sun', 12);

    /*根据行星名字和体积构造显示名字*/
    function nameConstructor(name,volume){
        let planetName = new THREE.Mesh( 
            new THREE.TextGeometry( name, {
                size: 4,
                height: 4
            }),
            new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide} )
        );
        planetName.volume = volume;
        planetName.visible = false;
        starNames[name] = planetName;
        scene.add(planetName);
	}
}

//动画处理
function move(){

	//行星的公转
	/*=>是es6语法中的arrow function
	 *star=>moveEachStar(star)
	 *function(star){
	 *	return moveEachStar(star);
	 }
	*/
	stars.forEach(star=>moveEachStar(star));

	//星星的自转
	stars.forEach(star=>moveSelfEachStar(star));

	//太阳的自转
	Sun.rotation.y = (Sun.rotation.y == 2*Math.PI ? 0.0008*Math.PI : Sun.rotation.y + 0.0008*Math.PI);


	//相机控制
	control.update(clock.getDelta());         //两次animationFrame的间隔时间，用于计算速度
	/*限制相机在xyz正负400以内*/
    camera.position.x = THREE.Math.clamp( camera.position.x, -400, 400 );
    camera.position.y = THREE.Math.clamp( camera.position.y, -400, 400 );
    camera.position.z = THREE.Math.clamp( camera.position.z, -400, 400 );

	//鼠标指向星星显示名字
	raycaster.setFromCamera(mouse,camera);
	//交汇点对象
	let intersects = raycaster.intersectObjects(scene.children);
    if( intersects.length > 0 ){
        /*取第一个交汇对像（最接近相机）*/
        let obj = intersects[ 0 ].object;

        let name = obj.name;
        /*把上一个显示隐藏*/
        displayName && (displayName.visible = false);

        /*如果是有设定名字的东西*/
        if( starNames[name] ){
            starNames[name].visible = true;
            displayName = starNames[name];
            /*复制行星位置*/
            displayName.position.copy(obj.position);
            /*文字居中*/
            displayName.geometry.center();
            /*显示在行星的上方（y轴）*/
            displayName.position.y = starNames[name].volume + 4;
            /*面向相机*/
            displayName.lookAt(camera.position);
        }

    }else{
            displayName && displayName.visible && ( displayName.visible = false )
    }
	renderer.render(scene,camera);
	requestAnimationFrame(()=>move());

	//帧率
	stat.update();
}
