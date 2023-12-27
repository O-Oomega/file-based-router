// ts类型待完成
import { Suspense, lazy, ComponentType } from 'react'

export const set = (obj: any, path: any, value: any): any => {
    // 当传入的obj不是对象时
    if (Object(obj) !== obj) return obj;
    //迭代path，在obj上沿着path一步步往下，找到目标位置,targetPoint是迭代后，目标位置的上一级指针
    //slice(0, -1)去掉了最后一个，迭代除最后一个以外的所有内容，每次都返回一个对象/数组的指针给下一个元素调用
    let targetPoint = path.slice(0, -1).reduce((lastObj: any, nowKey: any, i: any) => {
        // Object(lastObj[nowKey])构造这个键值的对象，如果和原本的不一样说明key不存在
        return Object(lastObj[nowKey]) === lastObj[nowKey]
            // 是的话，key存在，那么就把当前的对象继续传递下去
            ? lastObj[nowKey]
            // 不存在的话，就需要创建这个key，下面判断要新建的是对象还是数组
            : lastObj[nowKey] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] //下一个键是数组索引(数字)的话   注：>> 0是转数字，如果不是纯数字就会变成0， +path[i + 1]也是转数字，但是不是纯数字也可以转
                ? [] //是的话，就新建一个数组，防止下面使用索引报错
                : {}// 否的话，就新建一个对象
    }, obj);//这里的obj是初始值（初始的顶层对象）
    //到最后，把值分配
    targetPoint[path[path.length - 1]] = value; //最后将值分配给最后一个键 
    return obj; //返回修改后的对象的地址，有可能有人操作会用到
};

//为动态 import 包裹 lazy 和 Suspense
export const wrapSuspense = function (importer: () => Promise<{ default: ComponentType }>) {
    const Component = lazy(importer);
    // console.log(importer);
    return <Suspense fallback={null}>
    <Component />
    </Suspense>
}

export const loadComponent = async (path: string) => {
    try {
        const module = await import(/* @vite-ignore */path);
        return wrapSuspense(module.default); // 假设 wrapSuspense 是一个已定义的函数
    } catch (error) {
        // 如果模块不存在或导入失败，返回null
        console.error("Module load failed:", error);
        return <></>;
    }
};

