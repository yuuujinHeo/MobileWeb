import emitter from '@/lib/eventBus';

export default function TaskEvent(){
    const taskDone = () =>{
        emitter.emit('task','done');
    }
    
}