
function getBit(number:number, bitPosition:number) {
    return (number & (1 << bitPosition)) !== 0 ? 1 : 0;
}

function getBits(number) {
    let bits:number[] = [];
    // for (let i = 7; i >= 0; i--) { // 8비트 숫자이므로 7부터 0까지 반복
    for (let i = 0; i <8; i++) { // 8비트 숫자이므로 7부터 0까지 반복
        // console.log(i,bits);
        bits.push(getBit(number, i));
    }
    return bits;
}

export const transStatus = async(json) =>{
    return{
        condition:json.condition,
        pose:json.pose,
        vel:json.vel,
        power:json.power,
        state:json.state,
        time: json.time,
        motor0:{
            connection:json.motor[0].connection,
            temperature:json.motor[0].temp,
            status:{
                running:getBits(json.motor[0].status)[0]?true:false,
                mode:getBits(json.motor[0].status)[1]?true:false,
                jam:getBits(json.motor[0].status)[2]?true:false,
                current:getBits(json.motor[0].status)[3]?true:false,
                big:getBits(json.motor[0].status)[4]?true:false,
                input:getBits(json.motor[0].status)[5]?true:false,
                position:getBits(json.motor[0].status)[6]?true:false,
                collision:getBits(json.motor[0].status)[7]?true:false
            }
        },
        motor1:{
            connection:json.motor[1].connection,
            temperature:json.motor[1].temp,
            status:{
                running:getBits(json.motor[1].status)[0]?true:false,
                mode:getBits(json.motor[1].status)[1]?true:false,
                jam:getBits(json.motor[1].status)[2]?true:false,
                current:getBits(json.motor[1].status)[3]?true:false,
                big:getBits(json.motor[1].status)[4]?true:false,
                input:getBits(json.motor[1].status)[5]?true:false,
                position:getBits(json.motor[1].status)[6]?true:false,
                collision:getBits(json.motor[1].status)[7]?true:false
            }
        }
    }
}