// file: config/passportConfig.js
import passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy;
import User from '../models/User.js'; // Đường dẫn tới model User của bạn

export default function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // Tìm user bằng email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return done(null, false, { message: 'Email này chưa được đăng ký.' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
          return done(null, user); // Trả về user nếu thành công
        } else {
          return done(null, false, { message: 'Mật khẩu không đúng.' });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  // Không cần serialize/deserialize user cho JWT-based authentication
  // passport.serializeUser((user, done) => {
  //   done(null, user.id);
  // });

  // passport.deserializeUser(async (id, done) => {
  //   try {
  //     const user = await User.findById(id);
  //     done(null, user);
  //   } catch (err) {
  //     done(err, null);
  //   }
  // });
}