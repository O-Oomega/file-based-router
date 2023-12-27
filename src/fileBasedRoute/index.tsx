import {
  createBrowserRouter,
  RouteObject,
} from "react-router-dom";
import { wrapSuspense, set } from "./utils";
/* import Layout from "../pages/layout";
import Index from "../pages";
import A from "../pages/a";
import ALayout from "../pages/a/layout";
 */

/**
 * 
 * 约定式路由实现：
 * 1、目前只实现了第一层的约定式路由（不支持嵌套路由和动态路由）
 * 2、已实现第一层的layout
 */

//用于将页面组件转换为嵌套结构的json对象

const generatePathConfig = function() {
  // 引入除首页外的所有页面组件
  const pageModules = import.meta.glob('../pages/*/**/index.{ts,tsx}');
  const layoutModules = import.meta.glob('../pages/*/**/layout.{ts,tsx}');
  const modules  = {...pageModules, ...layoutModules};
  // console.log(modules);
  const pathConfig: Record<string, any> = {};

  Object.keys(modules).forEach((filePath) => {
    const routePath = filePath
      // 去除.
      .replace("../pages/", "")
      // 去除
      .replace(/\.tsx?/, "")
      // 路由在的json对象中的位置，lodash.set第二个参数
      .split('/')
    set(pathConfig, routePath, modules[filePath]);
  });
  // console.log(pathConfig);
  return pathConfig;
}

//将文件路径配置pathConfig映射为 react-router 路由
const mapPathConfigToRouteConfig = function(cfg: Record<string, any>) {
  const internalRoutes: RouteObject[] = [];
  Object.entries(cfg).forEach(([path, routes]) => {
    // const Element = routes.index.default;
    // console.log(routes.index);
    const internalRoute = {
      path,
      element:routes.layout?wrapSuspense(routes.layout):null,
      children:[
        {
          path:"",
          element:wrapSuspense(routes.index),
        }
      ]
    } as RouteObject
    internalRoutes.push(internalRoute);
  })
  return internalRoutes;
}

const pathConfig = generatePathConfig();

//判断是否有顶层layout
const checkTopLevelLayout = () => {
  const topLevelLayout = import.meta.glob('../pages/layout.{ts,tsx}');
  return Object.keys(topLevelLayout).length > 0;
}
const topLayoutExisted = checkTopLevelLayout();

const routeConfig:RouteObject[] = [{
  path:"/",
  element:topLayoutExisted?wrapSuspense(() => import("../pages/layout")):null,
  children:[
    {
      path:"",
      element:wrapSuspense(() => import("../pages")),
    },
    ...mapPathConfigToRouteConfig(pathConfig)
  ]
}];

console.log(routeConfig); 

/* const testRouter = [
  {
    path:"/",
    element: null,
    children:[
      {
        path:"",
        element:<Index />
      },
      {
        path:"a",
        element: <ALayout/>,
        children:[
          {
            path:"",
            element: <A/>,
          }
        ]
      }
    ]
  }
] */

export default createBrowserRouter(routeConfig);
// export default createBrowserRouter(testRouter);