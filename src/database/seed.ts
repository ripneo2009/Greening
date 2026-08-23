import {pool} from './pool.js';
const plants=[
 ['스투키','Dracaena angolensis','낮은 빛과 건조에도 비교적 강한 입문용 식물',1,15,32,30,70,200,15000,14,28,false,['desk','medium'],18000],
 ['몬스테라','Monstera deliciosa','넓은 잎이 매력적인 대표적인 실내 관엽식물',2,18,30,40,80,1000,15000,7,14,false,['medium','large'],32000],
 ['테이블야자','Chamaedorea elegans','부드러운 잎과 작은 크기로 책상에 잘 어울리는 식물',2,16,29,40,80,500,8000,7,10,true,['desk','small'],15000],
 ['아레카야자','Dypsis lutescens','밝은 공간에 시원한 분위기를 만드는 중대형 식물',3,18,30,45,80,2000,20000,5,10,true,['medium','large'],45000],
 ['스킨답서스','Epipremnum aureum','늘어지는 잎이 아름답고 반음지에서도 잘 자라는 식물',1,15,32,35,80,500,10000,7,14,false,['desk','small','hanging'],12000]
];
for(const p of plants)await pool.query(`INSERT INTO plants(common_name,scientific_name,description,difficulty,min_temperature_c,max_temperature_c,min_humidity,max_humidity,min_light_lux,max_light_lux,watering_days_min,watering_days_max,pet_safe,sizes,price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT DO NOTHING`,p);console.log('seed complete');await pool.end();
